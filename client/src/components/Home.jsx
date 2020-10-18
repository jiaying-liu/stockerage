import React from 'react'
import { useSelector } from 'react-redux'
import { Grid, makeStyles } from '@material-ui/core'
import PortfolioStats from './home/PortfolioStats'
import PortfolioChart from './home/PortfolioChart'
import PortfolioBreakdown from './home/PortfolioBreakdown'
import PortfolioOrderTable from './home/PortfolioOrderTable'
import StockList from './home/StockList'

const useStyles = makeStyles(() => ({
	portfolioStats: {
		'& h2': {
			marginTop: '0px'
		}
	}
}))

export default function Home () {
	const currentUser = useSelector(state => state.currentUser)
	const classes = useStyles()

	function renderPortfolioOverview () {
		return (
			<Grid
				container
				spacing={3}
				style={{ paddingTop: '96px' }}
			>
				<Grid item container direction='column' xs={8}>
					<Grid item className={classes.portfolioStats}>
						<PortfolioStats />
					</Grid>
					<Grid item>
						<PortfolioChart />
					</Grid>
				</Grid>
				<Grid
					item
					xs={4}
				>
					<StockList />
				</Grid>
			</Grid>
		)
	}

	if (!currentUser) {
		return null
	}

	return (
		<div>
			{renderPortfolioOverview()}
			<PortfolioBreakdown />
			<PortfolioOrderTable />
		</div>
	)
}
