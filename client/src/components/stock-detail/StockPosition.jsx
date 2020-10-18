import React from 'react'
import { useSelector } from 'react-redux'
import {
	Grid
} from '@material-ui/core'
import {
	formatCurrencyValue,
	formatNumberWithComma,
	formatPercentageValue
} from '@/helpers/value-format'

export default function StockPosition ({ userStock, stock }) {
	const userStocks = useSelector(state => state.userStocks)

	function getTotalMarketValueOfAllUserStocks () {
		return userStocks.reduce((acc, userStock) => acc + (userStock.quantity * userStock.latestPrice), 0)
	}
	
	function getTotalCost () {
		return userStock.avgCost * userStock.quantity
	}

	function getMarketValue () {
		return userStock.quantity * stock.latestPrice
	}

	function getTotalReturn () {
		return getMarketValue() - getTotalCost()
	}

	function getTotalReturnPercentage () {
		return getTotalReturn() / getTotalCost()
	}

	function getTotalReturnText () {
		const totalReturn = getTotalReturn()
		const totalReturnPercentage = getTotalReturnPercentage()
		const sign = totalReturn >= 0 ? '+' : ''

		return `${sign}${formatCurrencyValue(totalReturn)} (${sign}${formatPercentageValue(totalReturnPercentage)})`
	}

	function getPortfolioPercentageText () {
		const totalMarketValueOfAllStocks = getTotalMarketValueOfAllUserStocks()
		const marketValue = getMarketValue()
		const portfolioPercentage = marketValue / totalMarketValueOfAllStocks

		return formatPercentageValue(portfolioPercentage)
	}

	function renderStockPositionGridItem (label, value) {
		return (
			<Grid item>
				<div>{label}</div>
				<div><b>{value}</b></div>
			</Grid>
		)
	}

	if (!userStock || !stock) {
		return null
	}

	return (
		<Grid container spacing={6}>
			{renderStockPositionGridItem('Market Value', formatCurrencyValue(getMarketValue()))}
			{renderStockPositionGridItem('Shares', formatNumberWithComma(userStock.quantity))}
			{renderStockPositionGridItem('Average Cost', formatCurrencyValue(userStock.avgCost))}
			{renderStockPositionGridItem('Total Return', getTotalReturnText())}
			{renderStockPositionGridItem('Portfolio Percentage', getPortfolioPercentageText())}
		</Grid>
	)
}
