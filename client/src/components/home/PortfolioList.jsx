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
import { fetchUserStocks } from '@/actions/user-stocks'
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

export default function PortfolioList () {
	const currentUser = useSelector(state => state.currentUser)
	const userStocks = useSelector(state => state.userStocks)
	const history = useHistory()
	const dispatch = useDispatch()
	const classes = useStyles()

	useMountEffect(() => {
		if (!userStocks.length) {
			dispatch(fetchUserStocks(currentUser.id))
		}
	})

	function renderPortfolioListItem (stock, index) {
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
					secondary={`${stock.quantity} ${stock.quantity > 1 ? 'Shares' : 'Share'}`}
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

	if (!userStocks.length) {
		return (
			<div 
				style={{
					textAlign: 'center',
					marginTop: '50%'
				}}
			>
				You have no stocks in your portfolio. When you purchase stocks, they will show up here!
			</div>
		)
	}

	return (
		<List>
			{userStocks.map((userStock, index) => renderPortfolioListItem(userStock, index))}
		</List>
	)
}
