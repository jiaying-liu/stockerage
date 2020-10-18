import api from '@/api'
import {
	FETCH_MARKET_BUYS
} from './types'

export function fetchMarketBuys (userId) {
	return async function (dispatch) {
		const marketBuys = (await api.get(`/users/${userId}/market-buys`)).data

		dispatch({ type: FETCH_MARKET_BUYS, marketBuys })
	}
}
