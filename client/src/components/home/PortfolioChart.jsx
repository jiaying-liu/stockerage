import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core'
import { green, red } from '@material-ui/core/colors'
import PriceChart from '@/components/helper-components/PriceChart'
import api from '@/api'
import moment from 'moment-timezone'
import momentBusiness from 'moment-business'
import { formatCurrencyValue, formatPercentageValue } from '@/helpers/value-format'

const FIVE_DAYS = '5d'
const ONE_MONTH = '1m'
const SIX_MONTHS = '6m'
const ONE_YEAR = '1y'
const ALL_TIME = 'all'

const useStyles = makeStyles(() => ({
	positiveChange: {
		color: green[500]
	},
	negativeChange: {
		color: red[500]
	}
}))

export default function PortfolioChart () {
	const [timeRange, setTimeRange] = useState(FIVE_DAYS)
	const [chartData, setChartData] = useState([])
	const currentUser = useSelector(state => state.currentUser)
	const isRendered = useRef(false)
	const classes = useStyles()

	useEffect(() => {
		isRendered.current = true

		async function fetchChartData () {
			const chartDataResponse = await api.get(`/users/${currentUser.id}/portfolio/close-value/range/${timeRange}`)

			if (isRendered.current) {
				setChartData(chartDataResponse.data)
			}
		}

		fetchChartData()

		return () => {
			isRendered.current = false
		}
	}, [timeRange, setChartData, currentUser])

	function getBackfilledChartDataPointsToDate (momentDate) {
		const chartDataPoints = [...chartData].sort((a, b) => a.date < b.date ? -1 : 1)
		const startingCloseValue = 100000 // because every user starts out with this amount of cash
		let earliestDate = chartDataPoints.length ? moment(chartDataPoints[0].date) : moment()

		while (earliestDate.isAfter(momentDate)) {
			const newEarliestDate = momentBusiness.subtractWeekDays(earliestDate, 1)

			chartDataPoints.unshift({
				date: moment(newEarliestDate).format('YYYY-MM-DD'),
				value: startingCloseValue
			})

			earliestDate = newEarliestDate
		}

		return chartDataPoints
	}

	function getSortedAndBackfilledChartDataPoints () {
		let startDate = null
		switch (timeRange) {
			case FIVE_DAYS:
				startDate = momentBusiness.subtractWeekDays(moment(), 5)
				break
			case ONE_MONTH:
				startDate = moment().subtract(1, 'M')
				break
			case SIX_MONTHS:
				startDate = moment().subtract(6, 'M')
				break
			case ONE_YEAR:
				startDate = moment().subtract(1, 'y')
				break
			default:
		}

		if (startDate) {
			return getBackfilledChartDataPointsToDate(startDate)
		}

		startDate = chartData.length ? moment(chartData[0].date).subtract(1, 'd') : moment()

		return [{ date: startDate.format('YYYY-MM-DD'), value: 100000 }, ...chartData].sort((a, b) => a.date < b.date ? -1 : 1)
	}

	function getFormattedChartData () {
		return getSortedAndBackfilledChartDataPoints().map(chartDataPoint => ({
			name: moment(chartDataPoint.date).tz('America/New_York').format('MMM DD, YYYY'),
			value: Number(chartDataPoint.value)
		}))
	}

	function getTimeRangeTabs () {
		return [{
			label: '5D',
			value: FIVE_DAYS
		}, {
			label: '1M',
			value: ONE_MONTH
		}, {
			label: '6M',
			value: SIX_MONTHS
		}, {
			label: '1Y',
			value: ONE_YEAR
		}, {
			label: 'ALL',
			value: ALL_TIME
		}]
	}

	function renderReturnMsg () {
		let returnLabel = ''

		switch (timeRange) {
			case FIVE_DAYS:
				returnLabel = '5 Day'
				break
			case ONE_MONTH:
				returnLabel = '1 Month'
				break
			case SIX_MONTHS:
				returnLabel = '6 Month'
				break
			case ONE_YEAR:
				returnLabel = '1 Year'
				break
			case ALL_TIME:
				returnLabel = 'All Time'
				break
			default:
		}

		const returnValue = chartData.length > 1 ? chartData[chartData.length - 1].value - chartData[0].value : 0
		const returnPercentage = chartData.length > 0 ? returnValue / chartData[0].value : 0

		return (
			<div>
				{`${returnLabel} Return: ${formatCurrencyValue(returnValue)}`} (
					<span className={returnPercentage >= 0 ? classes.positiveChange : classes.negativeChange}>
						{`${returnPercentage > 0 ? '+' : ''}${formatPercentageValue(returnPercentage)}`}
					</span>
				)
			</div>
		)
	}

	return (
		<div>
			<h2>Past Performance</h2>
			{renderReturnMsg()}
			<PriceChart
				chartData={getFormattedChartData()}
				timeRangeTabs={getTimeRangeTabs()}
				onTimeRangeTabChange={value => setTimeRange(value)}
			/>
		</div>
	)
}
