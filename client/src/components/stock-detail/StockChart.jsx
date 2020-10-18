import React, { useState, useEffect, useRef } from 'react'
import api from '@/api'
import PriceChart from '@/components/helper-components/PriceChart'
import { formatCurrencyValue, formatPercentageValue } from '@/helpers/value-format'
import moment from 'moment-timezone'

const ONE_DAY = '1d'
const FIVE_DAYS = '5d'
const ONE_MONTH = '1m'
const SIX_MONTHS = '6m'
const ONE_YEAR = '1y'
const FIVE_YEARS = '5y'

export default function StockChart ({
	stock
}) {
	const [timeRange, setTimeRange] = useState(ONE_DAY)
	const [chartData, setChartData] = useState([])
	const isRendered = useRef(false)

	useEffect(() => {
		isRendered.current = true

		async function fetchChartData () {
			const chartDataResponse = await api.get(`/stocks/${stock.symbol}/chart`, {
				params: {
					timeRange
				}
			})

			if (isRendered.current) {
				setChartData(chartDataResponse.data)
			}
		}

		fetchChartData()

		return () => {
			isRendered.current = false
		}
	}, [stock, timeRange])

	function getFormattedHistoricalData () {
		return chartData.filter(chartDataPoint => chartDataPoint.close !== null).map(chartDataPoint => ({
			name: moment(chartDataPoint.date).format('MMM DD, YYYY'),
			value: chartDataPoint.close
		}))
	}

	function getFormattedIntradayData () {
		return chartData.filter(chartDataPoint => chartDataPoint.average !== null).map(chartDataPoint => ({
			name: chartDataPoint.label,
			value: chartDataPoint.average
		}))
	}

	function getFormattedChartData () {
		if (timeRange === ONE_DAY) {
			return getFormattedIntradayData()
		}

		return getFormattedHistoricalData()
	}

	function getTimeRangeTabs () {
		return [{
			label: '1D',
			value: ONE_DAY
		}, {
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
			label: '5Y',
			value: FIVE_YEARS
		}]
	}

	function getReturnText () {
		if (!chartData.length) {
			return ''
		}

		let returnLabel = ''

		switch (timeRange) {
			case ONE_DAY:
				returnLabel = 'One Day Return'
				break
			case FIVE_DAYS:
				returnLabel = 'Five Day Return'
				break
			case ONE_MONTH:
				returnLabel = 'One Month Return'
				break
			case SIX_MONTHS:
				returnLabel = 'Six Month Return'
				break
			case ONE_YEAR:
				returnLabel = 'One Year Return'
				break
			case FIVE_YEARS:
				returnLabel = 'Five Year Return'
				break
			default:
		}

		const earliestValue = timeRange === ONE_DAY ? stock.previousClose : chartData[0].close
		const latestValue = timeRange === ONE_DAY ? chartData[chartData.length - 1].average : chartData[chartData.length - 1].close
		const returnValue = latestValue - earliestValue
		const returnPercentage = returnValue / earliestValue

		return `${returnLabel}: ${formatCurrencyValue(returnValue)} (${returnPercentage > 0 ? '+' : ''}${formatPercentageValue(returnPercentage)})`
	}

	return (
		<div>
			<div>{getReturnText()}</div>
			<PriceChart
				chartData={getFormattedChartData()}
				timeRangeTabs={getTimeRangeTabs()}
				onTimeRangeTabChange={value => setTimeRange(value)}
			/>
		</div>
	)
}
