import {
	FETCH_WATCH_LIST_STOCKS,
	ADD_WATCH_LIST_STOCK,
	REMOVE_WATCH_LIST_STOCK
} from '@/actions/types'

export default function (state = [], action) {
	switch (action.type) {
		case FETCH_WATCH_LIST_STOCKS:
			return action.watchListStocks
		case ADD_WATCH_LIST_STOCK:
			return [...state, action.watchListStock]
		case REMOVE_WATCH_LIST_STOCK:
			return state.filter(watchListStock => watchListStock.id !== action.watchListStockId)
		default:
			return state
	}
}
