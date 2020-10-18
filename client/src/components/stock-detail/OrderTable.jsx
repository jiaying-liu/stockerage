import React from 'react'
import { useSelector } from 'react-redux'
import {
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	TableContainer,
	makeStyles
} from '@material-ui/core'
import moment from 'moment-timezone'
import { formatCurrencyValue } from '@/helpers/value-format'

const useStyles = makeStyles(() => ({
	tableHeader: {
		'& th': {
			fontWeight: 'bold'
		}
	}
}))

export default function OrderTable ({ stock }) {
	const marketBuys = useSelector(state => state.marketBuys)
	const marketSells = useSelector(state => state.marketSells)
	const limitBuys = useSelector(state => state.limitBuys)
	const limitSells = useSelector(state => state.limitSells)
	const classes = useStyles()

	function getAllOrders () {
		return [
			...marketBuys.map(marketBuy => ({ ...marketBuy, type: 'Market Buy' })),
			...marketSells.map(marketSell => ({ ...marketSell, type: 'Market Sell' })),
			...limitBuys.map(limitBuy => ({ ...limitBuy, type: 'Limit Buy' })),
			...limitSells.map(limitSell => ({ ...limitSell, type: 'Limit Sell' }))
		]
			.filter(order => order.stockSymbol.toLowerCase() === stock.symbol.toLowerCase())
			.sort((orderA, orderB) => (new Date(orderB.datetime)).getTime() - (new Date(orderA.datetime)).getTime())
	}

	function renderTableBody () {
		const orders = getAllOrders()

		return (
			<TableBody>
				{orders.map((order, index) => (
					<TableRow key={index}>
						<TableCell>{moment(order.datetime).local().format('MMM DD, YYYY')}</TableCell>
						<TableCell>{order.type}</TableCell>
						<TableCell>{order.quantity}</TableCell>
						<TableCell>{formatCurrencyValue(order.value)}</TableCell>
						<TableCell>{order.status}</TableCell>
					</TableRow>
				))}
			</TableBody>
		)
	}

	return (
		<TableContainer style={{ maxHeight: '500px' }}>
			<Table stickyHeader>
				<TableHead className={classes.tableHeader}>
					<TableRow>
						<TableCell>Date</TableCell>
						<TableCell>Type</TableCell>
						<TableCell>Quantity</TableCell>
						<TableCell>Value</TableCell>
						<TableCell>Status</TableCell>
					</TableRow>
				</TableHead>
				{renderTableBody()}
			</Table>
		</TableContainer>
	)
}
