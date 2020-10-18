import { combineReducers } from 'redux'
import currentUser from './current-user'
import userStocks from './user-stocks'
import marketBuys from './market-buys'
import marketSells from './market-sells'
import limitBuys from './limit-buys'
import limitSells from './limit-sells'
import watchListStocks from './watch-list-stocks'

export default combineReducers({
	currentUser,
	userStocks,
	marketBuys,
	marketSells,
	limitBuys,
	limitSells,
	watchListStocks
})
