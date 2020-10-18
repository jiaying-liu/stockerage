import api from '@/api'
import {
	FETCH_USER_STOCKS
} from './types'

export function fetchUserStocks (userId) {
	return async function (dispatch) {
		const userStocks = (await api.get(`/users/${userId}/stocks`)).data
			.filter(userStock => userStock.quantity > 0)
		const userStockStats = (await Promise.all(userStocks.map(userStock => api.get(`/stocks/${userStock.symbol}`))))
			.map(userStockStatResponse => userStockStatResponse.data)
		const userPortfolioStocks = userStocks
			.map((userStock, index) => ({
				id: userStock.id,
				quantity: userStock.quantity,
				symbol: userStock.symbol,
				avgCost: userStock.avgCost,
				name: userStockStats[index].name,
				latestPrice: userStockStats[index].latestPrice,
				previousClose: userStockStats[index].previousClose
			}))
		
		dispatch({ type: FETCH_USER_STOCKS, userStocks: userPortfolioStocks })
	}
}
