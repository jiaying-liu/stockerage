import React from 'react'
import {
	Grid
} from '@material-ui/core'
import {
	formatCurrencyValue,
	formatLargeCurrencyValue,
	formatLargeNumber,
	formatPercentageValue
} from '@/helpers/value-format'
import moment from 'moment-timezone'

export default function StockSummary ({ stock }) {
	function renderStockStatGridItem (label, value) {
		return (
			<Grid
				item
				xs={3}
			>
				<div>{label}</div>
				<div><b>{value}</b></div>
			</Grid>
		)
	}

	return (
		<Grid container spacing={3}>
			{renderStockStatGridItem('Market Cap', formatLargeCurrencyValue(stock.marketCap))}
			{renderStockStatGridItem('Volume', formatLargeNumber(stock.volume))}
			{renderStockStatGridItem('Avg 10 Day Volume', formatLargeNumber(stock.avg10Volume))}
			{renderStockStatGridItem('P/E Ratio', stock.peRatio)}
			{renderStockStatGridItem('52 Week High', formatCurrencyValue(stock.week52High))}
			{renderStockStatGridItem('52 Week Low', formatCurrencyValue(stock.week52Low))}
			{renderStockStatGridItem('Dividend Yield', formatPercentageValue(stock.dividendYield) || '--')}
			{renderStockStatGridItem('Next Earnings Date', stock.nextEarningsDate ? moment(stock.nextEarningsDate).format('MMM DD, YYYY') : '--')}
		</Grid>
	)
}
