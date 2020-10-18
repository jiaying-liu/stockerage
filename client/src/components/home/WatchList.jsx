import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import useMountEffect from '@/hooks/use-mount-effect'
import { useHistory } from 'react-router-dom'
import {
	List,
	ListItem,
	ListItemText,
	makeStyles
} from '@material-ui/core'
import { red, green } from '@material-ui/core/colors'
import { fetchWatchListStocks } from '@/actions/watch-list-stocks'
import { formatCurrencyValue, formatPercentageValue } from '@/helpers/value-format'

const useStyles = makeStyles(() => ({
	positiveChange: {
		'& .MuiTypography-colorTextSecondary': {
			color: green[500]
		}
	},
	negativeChange: {
		'& .MuiTypography-colorTextSecondary': {
			color: red[500]
		}
	}
}))

export default function WatchList () {
	const currentUser = useSelector(state => state.currentUser)
	const watchListStocks = useSelector(state => state.watchListStocks)
	const history = useHistory()
	const dispatch = useDispatch()
	const classes = useStyles()

	useMountEffect(() => {
		if (!watchListStocks.length) {
			dispatch(fetchWatchListStocks(currentUser.id))
		}
	})

	function renderWatchListItem (stock, index) {
		const { latestPrice, previousClose } = stock
		const stockPercentChange = (latestPrice - previousClose) / previousClose
		let previousCloseText = formatPercentageValue(stockPercentChange)
		let className = ''

		if (stockPercentChange > 0) {
			previousCloseText = '+' + previousCloseText
			className = classes.positiveChange
		} else if (stockPercentChange < 0) {
			className = classes.negativeChange
		}

		return (
			<ListItem
				key={index}
				button
				onClick={() => history.push(`/stocks/${stock.symbol}`)}
			>
				<ListItemText
					primary={stock.symbol}
				/>
				<ListItemText
					primary={formatCurrencyValue(latestPrice)}
					secondary={previousCloseText}
					style={{ textAlign: 'right' }}
					className={className}
				/>
			</ListItem>
		)
	}

	if (!watchListStocks.length) {
		return (
			<div 
				style={{
					textAlign: 'center',
					marginTop: '50%'
				}}
			>
				You have no stocks in your watch list. When you watch list stocks, they will show up here!
			</div>
		)
	}

	return (
		<List>
			{watchListStocks.map((stock, index) => renderWatchListItem(stock, index))}
		</List>
	)
}
