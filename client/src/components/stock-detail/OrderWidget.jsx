import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
	Card,
	CardContent,
	FormControl,
	Tabs,
	Tab,
	Select,
	OutlinedInput,
	Grid,
	InputLabel,
	InputAdornment,
	Button,
	makeStyles,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle
} from '@material-ui/core'
import { formatCurrencyValue } from '@/helpers/value-format'
import api from '@/api'

const BUY = 'buy'
const SELL = 'sell'
const MARKET = 'market'
const LIMIT = 'limit'

const useStyles = makeStyles(() => ({
	orderCard: {
		position: 'fixed',
		marginRight: '24px'
	},
	orderWidgetRow: {
		marginTop: '16px'
	}
}))

export default function OrderWidget ({ stock }) {
	const [orderOption, setOrderOption] = useState(BUY)
	const [orderType, setOrderType] = useState(MARKET)
	const [quantity, setQuantity] = useState(0)
	// Limit Price needs to be string because we need to permit users to input decimal points
	const [limitPrice, setLimitPrice] = useState('')
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
	const currentUser = useSelector(state => state.currentUser)
	const userStocks = useSelector(state => state.userStocks)
	const classes = useStyles()

	function onQuantityChange (event) {
		const value = Math.floor(Number(event.target.value || NaN))
		setQuantity(value)
	}

	function getUserStockPosition () {
		return userStocks.find(userStock => userStock.symbol.toLowerCase() === stock.symbol.toLowerCase())
	}

	function onLimitPriceChange (event) {
		setLimitPrice(event.target.value)
	}

	function getEstimatedAmount () {
		if (orderType === MARKET) {
			return stock.latestPrice * (quantity || 0)
		} else {
			return Number(Number(limitPrice).toFixed(2)) * (quantity || 0)
		}
	}

	function shouldDisableButton () {
		const userStockPosition = getUserStockPosition()

		return !orderType || !orderOption || quantity <= 0 || (userStockPosition && orderOption === SELL && quantity > userStockPosition.quantity)
	}

	function getMarketOrderConfirmationMsg () {
		return `Do you want make a MARKET ${orderOption.toUpperCase()} order for ${quantity} shares of ${stock.symbol.toUpperCase()}?`
	}

	function getLimitOrderConfirmationMsg () {
		return `Do you want to make a LIMIT ${orderOption.toUpperCase()} order for ${quantity} shares of ${stock.symbol.toUpperCase()} at a limit price of ${formatCurrencyValue(Number(limitPrice))}?`
	}

	function executeMarketBuy () {
		return api.post(`/users/${currentUser.id}/market-buys`, {
			stockSymbol: stock.symbol,
			quantity
		})
	}

	function executeMarketSell () {
		return api.post(`/users/${currentUser.id}/market-sells`, {
			stockSymbol: stock.symbol,
			quantity
		})
	}

	function executeLimitBuy () {
		return api.post(`/users/${currentUser.id}/limit-buys`, {
			stockSymbol: stock.symbol,
			quantity,
			limitPrice
		})
	}

	function executeLimitSell () {
		return api.post(`/users/${currentUser.id}/limit-sells`, {
			stockSymbol: stock.symbol,
			quantity,
			limitPrice
		})
	}

	function onExecuteOrderClick () {
		setConfirmDialogOpen(false)

		if (orderType === MARKET && orderOption === BUY) {
			executeMarketBuy()
		} else if (orderType === MARKET && orderOption === SELL) {
			executeMarketSell()
		} else if (orderType === LIMIT && orderOption === BUY) {
			executeLimitBuy()
		} else if (orderType === LIMIT && orderOption === SELL) {
			executeLimitSell()
		}
	}

	function renderTabs () {
		return (
			<Tabs
				value={orderOption}
				onChange={(event, value) => setOrderOption(value)}
				variant='fullWidth'
				indicatorColor='primary'
				textColor='primary'
			>
				<Tab label={BUY} value={BUY} />
				<Tab label={SELL} value={SELL} disabled={!getUserStockPosition()} />
			</Tabs>
		)
	}

	function renderLimitPriceInput () {
		if (orderType !== LIMIT) {
			return null
		}

		return (
			<FormControl variant='outlined' fullWidth className={classes.orderWidgetRow}>
				<InputLabel>Limit Price</InputLabel>
				<OutlinedInput
					value={limitPrice}
					type='number'
					label='Limit Price'
					startAdornment={<InputAdornment position='start'>$</InputAdornment>}
					onChange={onLimitPriceChange}
				/>
			</FormControl>
		)
	}

	function renderCostSection () {
		return (
			<Grid
				container
				className={classes.orderWidgetRow}
			>
				<Grid item container justify='space-between'>
					<Grid item>
						<b>Estimated Amount</b>
					</Grid>
					<Grid item>
						<b>{formatCurrencyValue(getEstimatedAmount())}</b>
					</Grid>
				</Grid>
				<Grid item container justify='space-between'>
					<Grid item>
						<b>Buying Power</b>
					</Grid>
					<Grid item>
						<b>{formatCurrencyValue(currentUser.balance)}</b>
					</Grid>
				</Grid>
			</Grid>
		)
	}

	function renderConfirmDialog () {
		return (
			<Dialog
				open={confirmDialogOpen}
				onClose={() => setConfirmDialogOpen(false)}
			>
				<DialogTitle>Order Confirmation</DialogTitle>
				<DialogContent>
					{orderType === MARKET ? getMarketOrderConfirmationMsg() : getLimitOrderConfirmationMsg()}
				</DialogContent>
				<DialogActions>
					<Button
						variant='outlined'
						onClick={() => setConfirmDialogOpen(false)}
					>
						Cancel
					</Button>
					<Button
						color='primary'
						variant='contained'
						onClick={onExecuteOrderClick}
					>
						Confirm
					</Button>
				</DialogActions>
			</Dialog>
		)
	}

	return (
		<div>
			<Card
				raised
				className={classes.orderCard}
			>
				<CardContent>
					{renderTabs()}
					<Grid
						container
						spacing={1}
						className={classes.orderWidgetRow}
					>
						<Grid item xs={6}>
							<FormControl variant='outlined' fullWidth>
								<InputLabel>Order Type</InputLabel>
								<Select
									native
									label='Order Type'
									value={orderType}
									onChange={event => setOrderType(event.target.value)}
								>
									<option value={MARKET}>Market</option>
									<option value={LIMIT}>Limit</option>
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={6}>
							<FormControl variant='outlined' fullWidth>
								<InputLabel>Quantity</InputLabel>
								<OutlinedInput
									value={(quantity || quantity === 0) ? quantity : ''}
									type='number'
									label='Quantity'
									onChange={onQuantityChange}
								/>
							</FormControl>
						</Grid>
					</Grid>
					{renderLimitPriceInput()}
					{renderCostSection()}
					<Button
						variant='contained'
						color='primary'
						disabled={shouldDisableButton()}
						fullWidth
						className={classes.orderWidgetRow}
						onClick={() => setConfirmDialogOpen(true)}
					>
						Execute Order
					</Button>
				</CardContent>
			</Card>
			{renderConfirmDialog()}
		</div>
	)
}
