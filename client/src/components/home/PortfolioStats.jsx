import React, { useState, useRef } from 'react'
import CountUp from 'react-countup'
import { makeStyles } from '@material-ui/core'
import { green, red } from '@material-ui/core/colors'
import useMountEffect from '@/hooks/use-mount-effect'
import usePrevious from '@/hooks/use-previous'
import api from '@/api'
import { useSelector } from 'react-redux'
import { formatCurrencyValue, formatPercentageValue } from '@/helpers/value-format'
import moment from 'moment-timezone'
import momentBusiness from 'moment-business'

const useStyles = makeStyles(() => ({
	portfolioValue: {
		fontSize: 32,
		fontWeight: 'bold'
	},
	positiveChange: {
		color: green[500]
	},
	negativeChange: {
		color: red[500]
	}
}))

export default function PortfolioStats () {
	const [portfolioValue, setPortfolioValue] = useState(0)
	const [closeValue, setCloseValue] = useState(0)
	const currentUser = useSelector(state => state.currentUser)
	const prevPortfolioValue = usePrevious(portfolioValue)
	const classes = useStyles()
	const isMounted = useRef(false)

	useMountEffect(() => {
		isMounted.current = true
		updatePortfolioValue()
		getLastPortfolioClose()

		return () => {
			isMounted.current = false
		}
	})

	async function updatePortfolioValue () {
		const portfolioValueData = (await api.get(`/users/${currentUser.id}/portfolio/value`)).data
	
		if (isMounted.current) {
			setPortfolioValue(portfolioValueData.portfolioValue)
		}
	}

	function safeSetCloseValue (newCloseValue) {
		if (isMounted.current) {
			setCloseValue(newCloseValue)
		}
	}

	async function getLatestPortfolioClose () {
		try {
			const portfolioCloseData = (await api.get(`/users/${currentUser.id}/portfolio/close-value`)).data

			safeSetCloseValue(portfolioCloseData.closeValue)
		} catch (error) {
			console.error(`Error while getting latest portfolio close: ${error.message}`)
			
			safeSetCloseValue(100000)
		}
	}

	async function getLastPortfolioClose () {
		try {
			const lastTradingDay = momentBusiness.subtractWeekDays(moment().tz('America/New_York'), 1)
			const portfolioCloseData = (await api.get(`/users/${currentUser.id}/portfolio/close-value`, {
				params: {
					date: lastTradingDay.format('YYYY-MM-DD')
				}
			})).data

			safeSetCloseValue(portfolioCloseData.closeValue)
		} catch (error) {
			// If cannot get last trading day just fetch server for latest trading day
			console.error(`Error while getting close price for last trading day, fetching latest close value instead: ${error.message}`)
			getLatestPortfolioClose()
		}
	}

	const todayReturn = portfolioValue - closeValue
	const todayReturnPercentage = todayReturn / closeValue

	return (
		<div>
			<h2>Portfolio Value</h2>
			<CountUp
				start={prevPortfolioValue}
				end={portfolioValue}
				duration={1}
				separator=','
				decimals={2}
				decimal='.'
				prefix='$'
				className={classes.portfolioValue}
			/>
			<div>
				Today's Return: {formatCurrencyValue(todayReturn)} (
					<span className={todayReturnPercentage >= 0 ? classes.positiveChange : classes.negativeChange}>
						{todayReturnPercentage > 0 ? '+' : ''}{formatPercentageValue(todayReturnPercentage)}
					</span>
				)
			</div>
			<div>Remaining Cash: {formatCurrencyValue(currentUser.balance)}</div>
		</div>
	)
}
