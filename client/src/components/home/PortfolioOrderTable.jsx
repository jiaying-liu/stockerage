import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import useMountEffect from '@/hooks/use-mount-effect'
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
import { fetchMarketBuys } from '@/actions/market-buys'
import { fetchMarketSells } from '@/actions/market-sells'
import { fetchLimitBuys } from '@/actions/limit-buys'
import { fetchLimitSells } from '@/actions/limit-sells'

const useStyles = makeStyles(() => ({
	tableHeader: {
		'& th': {
			fontWeight: 'bold'
		}
	}
}))

export default function PortfolioOrderTable () {
	const currentUser = useSelector(state => state.currentUser)
	const marketBuys = useSelector(state => state.marketBuys)
	const marketSells = useSelector(state => state.marketSells)
	const limitBuys = useSelector(state => state.limitBuys)
	const limitSells = useSelector(state => state.limitSells)
	const classes = useStyles()
	const dispatch = useDispatch()

	useMountEffect(() => {
		if (!marketBuys.length) {
			dispatch(fetchMarketBuys(currentUser.id))
		}

		if (!marketSells.length) {
			dispatch(fetchMarketSells(currentUser.id))
		}

		if (!limitBuys.length) {
			dispatch(fetchLimitBuys(currentUser.id))
		}

		if (!limitSells.length) {
			dispatch(fetchLimitSells(currentUser.id))
		}
	})

	function getOrdersForTable () {
		return [
			...marketBuys.map(marketBuy => ({ ...marketBuy, type: 'Market Buy' })),
			...marketSells.map(marketSell => ({ ...marketSell, type: 'Market Sell' })),
			...limitBuys.map(limitBuy => ({ ...limitBuy, type: 'Limit Buy' })),
			...limitSells.map(limitSell => ({ ...limitSell, type: 'Limit Sell' }))
		].sort((orderA, orderB) => (new Date(orderB.datetime)).getTime() - (new Date(orderA.datetime)).getTime())
	}

	function renderTableBody () {
		const orders = getOrdersForTable()

		return (
			<TableBody>
				{orders.map((order, index) => (
					<TableRow key={index}>
						<TableCell>{moment(order.datetime).local().format('MMM DD, YYYY')}</TableCell>
						<TableCell>{order.stockSymbol}</TableCell>
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
		<div>
			<h2>Orders</h2>
			<TableContainer style={{ maxHeight: '500px' }}>
				<Table stickyHeader>
					<TableHead className={classes.tableHeader}>
						<TableRow>
							<TableCell>Date</TableCell>
							<TableCell>Stock</TableCell>
							<TableCell>Type</TableCell>
							<TableCell>Quantity</TableCell>
							<TableCell>Value</TableCell>
							<TableCell>Status</TableCell>
						</TableRow>
					</TableHead>
					{renderTableBody()}
				</Table>
			</TableContainer>
		</div>
	)
}
