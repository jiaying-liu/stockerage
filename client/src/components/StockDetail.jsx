import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import api from '@/api'
import {
	Grid,
	Tabs,
	Tab,
	IconButton,
	Tooltip,
	makeStyles
} from '@material-ui/core'
import {
	grey
} from '@material-ui/core/colors'
import Toast from '@/components/helper-components/Toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import StockChart from './stock-detail/StockChart'
import OrderWidget from './stock-detail/OrderWidget'
import StockSummary from './stock-detail/StockSummary'
import StockProfile from './stock-detail/StockProfile'
import StockPosition from './stock-detail/StockPosition'
import OrderTable from './stock-detail/OrderTable'
import { formatCurrencyValue } from '@/helpers/value-format'
import { fetchUserStocks } from '@/actions/user-stocks'
import { fetchMarketBuys } from '@/actions/market-buys'
import { fetchMarketSells } from '@/actions/market-sells'
import { fetchLimitBuys } from '@/actions/limit-buys'
import { fetchLimitSells } from '@/actions/limit-sells'
import { fetchWatchListStocks, addWatchListStock, removeWatchListStock } from '@/actions/watch-list-stocks'

const useStyles = makeStyles(() => ({
	stockValue: {
		fontSize: 32,
		fontWeight: 'bold'
	}
}))

export default function StockDetail () {
	const { symbol } = useParams()
	const [stock, setStock] = useState(null)
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState('')
	const currentUser = useSelector(state => state.currentUser)
	const userStocks = useSelector(state => state.userStocks)
	const marketBuys = useSelector(state => state.marketBuys)
	const marketSells = useSelector(state => state.marketSells)
	const limitBuys = useSelector(state => state.limitBuys)
	const limitSells = useSelector(state => state.limitSells)
	const watchListStocks = useSelector(state => state.watchListStocks)
	const [detailTab, setDetailTab] = useState(getUserStock() ? 'position' : 'summary')
	const dispatch = useDispatch()
	const classes = useStyles()

	useEffect(() => {
		async function fetchStock () {
			const stockData = (await api.get(`/stocks/${symbol}`)).data

			setStock(stockData)
		}

		fetchStock()
	}, [symbol, setStock])

	useEffect(() => {
		if (currentUser) {
			dispatch(fetchUserStocks(currentUser.id))
			dispatch(fetchMarketBuys(currentUser.id))
			dispatch(fetchMarketSells(currentUser.id))
			dispatch(fetchLimitBuys(currentUser.id))
			dispatch(fetchLimitSells(currentUser.id))
			dispatch(fetchWatchListStocks(currentUser.id))
		}
	}, [currentUser, dispatch])

	useEffect(() => {
		if (getUserStock()) {
			setDetailTab('position')
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userStocks])

	// Gets the user's position of the current stock in the stock detail page
	function getUserStock () {
		const userStock = userStocks.find(userStock => userStock.symbol.toLowerCase() === symbol.toLowerCase())

		return userStock
	}

	function getOrdersForStock () {
		return [...marketBuys, ...marketSells, ...limitBuys, ...limitSells].filter(order => order.stockSymbol.toLowerCase() === stock.symbol.toLowerCase())
	}

	function getUserWatchListStock () {
		return watchListStocks.find(watchListStock => watchListStock.symbol.toLowerCase() === stock.symbol.toLowerCase())
	}

	async function onAddStockToWatchList () {
		await dispatch(addWatchListStock(currentUser.id, stock.symbol))
		setToastMessage(`${stock.symbol} has been added to your Watch List!`)
		setShowToast(true)
	}

	async function onRemoveStockFromWatchList () {
		await dispatch(removeWatchListStock(currentUser.id, getUserWatchListStock().id))
		setToastMessage(`${stock.symbol} has been removed from your Watch List!`)
		setShowToast(true)
	}

	function onToastClose () {
		setShowToast(false)
	}

	function renderDetailTabs () {
		const tabOptions = ['summary', 'profile']
		const userStock = getUserStock()

		if (userStock) {
			tabOptions.unshift('position')
		}

		if (getOrdersForStock().length) {
			tabOptions.push('orders')
		}

		return (
			<Tabs
				value={detailTab}
				onChange={(event, value) => setDetailTab(value)}
				indicatorColor='primary'
				textColor='primary'
				style={{ borderBottom: `1px solid ${grey[500]}` }}
			>
				{tabOptions.map((tabOption, index) => (
					<Tab
						key={index}
						label={tabOption}
						value={tabOption}
					/>
				))}
			</Tabs>
		)
	}

	function renderTabContent () {
		switch (detailTab) {
			case 'position':
				return (
					<StockPosition
						userStock={getUserStock()}
						stock={stock}
					/>
				)
			case 'summary':
				return <StockSummary stock={stock} />
			case 'profile':
				return <StockProfile stock={stock} />
			case 'orders':
				return (
					<div style={{ marginTop: '-16px' }}>
						<OrderTable stock={stock} />
					</div>
				)
			default:
				return null
		}
	}

	function renderAddToWatchListButton () {
		const isStockAddedToWatchList = Boolean(getUserWatchListStock())
		const icon = isStockAddedToWatchList ? faCheckCircle : faPlusCircle
		const iconButtonCallback = isStockAddedToWatchList ? onRemoveStockFromWatchList : onAddStockToWatchList
		const tooltipContent = isStockAddedToWatchList ? 'Remove from Watch List' : 'Add to Watch List'

		return (
			<Tooltip
				title={<span style={{ fontSize: '12px' }}>{tooltipContent}</span>}
				placement='right'
				arrow
			>
				<IconButton
					color='primary'
					onClick={iconButtonCallback}
					style={{ padding: '0px', marginLeft: '12px' }}
				>
					<FontAwesomeIcon
						icon={icon}
					/>
				</IconButton>
			</Tooltip>
		)
	}

	if (!stock || !currentUser) {
		return null
	}

	return (
		<div>
			<Grid
				container
				spacing={3}
				style={{ paddingTop: '96px' }}
			>
				<Grid
					item
					container
					direction='column'
					xs={8}
				>
					<Grid item container direction='column'>
						<Grid item container>
							<Grid item><h1 style={{ marginBottom: '0px', marginTop: '0px' }}>{stock.symbol}</h1></Grid>
							<Grid item style={{ alignSelf: 'center' }}>
								{renderAddToWatchListButton()}
							</Grid>
						</Grid>
						<Grid item><h3 style={{ marginTop: '0px' }}>{stock.name}</h3></Grid>
						<Grid item><div className={classes.stockValue}>{formatCurrencyValue(stock.latestPrice)}</div></Grid>
						<Grid item><StockChart stock={stock} /></Grid>
					</Grid>
					<Grid item>
						{renderDetailTabs()}
						<div style={{ marginTop: '16px' }}>
							{renderTabContent()}
						</div>
					</Grid>
				</Grid>
				<Grid
					item
					xs={4}
				>
					<OrderWidget stock={stock} />
				</Grid>
			</Grid>
			<Toast
				open={showToast}
				message={toastMessage}
				onClose={onToastClose}
			/>
		</div>
	)
}
