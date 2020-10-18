import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import useMountEffect from '@/hooks/use-mount-effect'
import {
	Tabs,
	Tab,
	Card,
	CardContent
} from '@material-ui/core'
import { fetchUserStocks } from '@/actions/user-stocks'
import PortfolioList from './PortfolioList'
import WatchList from './WatchList'

const PORTFOLIO = 'portfolio'
const WATCH_LIST = 'watch-list'

export default function StockList () {
	const [currentTab, setCurrentTab] = useState(PORTFOLIO)
	const currentUser = useSelector(state => state.currentUser)
	const userStocks = useSelector(state => state.userStocks)
	const dispatch = useDispatch()

	useMountEffect(() => {
		if (!userStocks.length) {
			dispatch(fetchUserStocks(currentUser.id))
		}
	})

	function renderTabs () {
		return (
			<Tabs
				value={currentTab}
				onChange={(event, value) => setCurrentTab(value)}
				variant='fullWidth'
				indicatorColor='primary'
				textColor='primary'
			>
				<Tab label='Portfolio' value={PORTFOLIO} />
				<Tab label='Watch List' value={WATCH_LIST} />
			</Tabs>
		)
	}

	function renderTabContent () {
		if (currentTab === PORTFOLIO) {
			// return renderPortfolioList()
			return <PortfolioList />
		} else if (currentTab === WATCH_LIST) {
			return <WatchList />
		}

		return null
	}

	return (
		<Card raised style={{ height: '520px' }}>
			<CardContent>
				{renderTabs()}
				{/* <div style={{ marginTop: '16px' }}> */}
				<div style={{ height: '428px', overflow: 'auto' }}>
					{renderTabContent()}
				</div>
				{/* </div> */}
			</CardContent>
		</Card>
	)
}
