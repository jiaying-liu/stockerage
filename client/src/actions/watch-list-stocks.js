import api from '@/api'
import {
	FETCH_WATCH_LIST_STOCKS,
	ADD_WATCH_LIST_STOCK,
	REMOVE_WATCH_LIST_STOCK
} from './types'

export function fetchWatchListStocks (userId) {
	return async function (dispatch) {
		const userWatchListStocks = (await api.get(`/users/${userId}/watch-list-stocks`)).data
		const watchListStockStatsResponses = (await Promise.all(userWatchListStocks.map(watchListStock => api.get(`/stocks/${watchListStock.symbol}`))))
		const watchListStockStats = watchListStockStatsResponses.map(watchListStockStatResponse => watchListStockStatResponse.data)
		const watchListStocks = userWatchListStocks.map((watchListStock, index) => ({
			id: watchListStock.id,
			symbol: watchListStock.symbol,
			latestPrice: watchListStockStats[index].latestPrice,
			previousClose: watchListStockStats[index].previousClose
		}))

		dispatch({ type: FETCH_WATCH_LIST_STOCKS, watchListStocks })
	}
}

export function addWatchListStock (userId, symbol) {
	return async function (dispatch) {
		const watchListStockPostResponse = (await api.post(`/users/${userId}/watch-list-stocks`, {
			symbol
		})).data
		const watchListStockStat = (await api.get(`/stocks/${symbol}`)).data

		dispatch({ type: ADD_WATCH_LIST_STOCK, watchListStock: {
			id: watchListStockPostResponse.id,
			symbol,
			latestPrice: watchListStockStat.latestPrice,
			previousClose: watchListStockStat.previousClose
		}})
	}
}

export function removeWatchListStock (userId, watchListStockId) {
	return async function (dispatch) {
		await api.delete(`/users/${userId}/watch-list-stocks/${watchListStockId}`)

		dispatch({ type: REMOVE_WATCH_LIST_STOCK, watchListStockId })
	}
}
