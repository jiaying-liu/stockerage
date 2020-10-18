import React from 'react'
import { Grid } from '@material-ui/core'
import { formatLargeNumber } from '@/helpers/value-format'

export default function StockProfile ({ stock }) {
	function renderStockStatGridItem (label, value) {
		return (
			<Grid
				item
				xs={4}
			>
				<div>{label}</div>
				<div><b>{value}</b></div>
			</Grid>
		)
	}

	return (
		<div>
			<p>
				{stock.description}
			</p>
			<Grid container spacing={3}>
				{renderStockStatGridItem('CEO', stock.ceo)}
				{renderStockStatGridItem('Industry', stock.industry)}
				{renderStockStatGridItem('Number of Employees', formatLargeNumber(stock.employees))}
			</Grid>
		</div>
	)
}
