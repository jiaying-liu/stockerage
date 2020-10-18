import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import useMountEffect from '@/hooks/use-mount-effect'
import {
	Grid,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	makeStyles,
	TableContainer
} from '@material-ui/core'
import {
	useTheme
} from '@material-ui/core/styles'
import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Tooltip
} from 'recharts'
import { formatCurrencyValue } from '@/helpers/value-format'
import { fetchUserStocks } from '@/actions/user-stocks'

const useStyles = makeStyles(() => ({
	tableHeader: {
		'& th': {
			fontWeight: 'bold'
		}
	}
}))

export default function PortfolioBreakdown () {
	const currentUser = useSelector(state => state.currentUser)
	const userStocks = useSelector(state => state.userStocks)
	const classes = useStyles()
	const theme = useTheme()
	const history = useHistory()
	const dispatch = useDispatch()

	useMountEffect(() => {
		if (!userStocks.length) {
			dispatch(fetchUserStocks(currentUser.id))
		}
	})

	function getUserStockTotalCost (userStock) {
		return userStock.quantity * userStock.avgCost
	}

	function getUserStockMarketValue (userStock) {
		return userStock.quantity * userStock.latestPrice
	}

	function getUserStockTotalReturn (userStock) {
		return getUserStockMarketValue(userStock) - getUserStockTotalCost(userStock)
	}

	function getPieData () {
		return userStocks.map(userStock => ({
			name: userStock.symbol,
			value: getUserStockMarketValue(userStock)
		})).sort((userStockA, userStockB) => userStockB.value - userStockA.value)
	}

	function renderTableBody () {
		return (
			<TableBody>
				{userStocks.map((userStock, index) => (
					<TableRow
						key={index}
						hover
						onClick={() => history.push(`stocks/${userStock.symbol}`)}
						style={{ cursor: 'pointer' }}
					>
						<TableCell>{userStock.symbol}</TableCell>
						<TableCell>{userStock.name}</TableCell>
						<TableCell>{userStock.quantity}</TableCell>
						<TableCell>{formatCurrencyValue(userStock.latestPrice)}</TableCell>
						<TableCell>{formatCurrencyValue(userStock.avgCost)}</TableCell>
						<TableCell>{formatCurrencyValue(getUserStockTotalReturn(userStock))}</TableCell>
						<TableCell>{formatCurrencyValue(getUserStockMarketValue(userStock))}</TableCell>
					</TableRow>
				))}
			</TableBody>
		)
	}

	function renderTable () {
		return (
			<TableContainer style={{ maxHeight: '520px' }}>
				<Table stickyHeader>
					<TableHead className={classes.tableHeader}>
						<TableRow>
							<TableCell>Symbol</TableCell>
							<TableCell>Name</TableCell>
							<TableCell>Shares</TableCell>
							<TableCell>Price</TableCell>
							<TableCell>Average Cost</TableCell>
							<TableCell>Total Return</TableCell>
							<TableCell>Market Value</TableCell>
						</TableRow>
					</TableHead>
					{renderTableBody()}
				</Table>
			</TableContainer>
		)
	}

	function renderPieChart () {
		return (
			<ResponsiveContainer>
				<PieChart>
					<Pie
						data={getPieData()}
						dataKey="value"
						nameKey="name"
						fill={theme.palette.primary.main}
					/>
					<Tooltip
						formatter={formatCurrencyValue}
					/>
				</PieChart>
			</ResponsiveContainer>
		)
	}

	return (
		<div>
			<h2>Portfolio Breakdown</h2>
			<Grid container spacing={3}>
				<Grid item xs={8}>
					{renderTable()}
				</Grid>
				<Grid
					item
					xs={4}
					style={{ minHeight: '350px', minWidth: '350px' }}
				>	
					{renderPieChart()}
				</Grid>
			</Grid>
		</div>
	)
}
