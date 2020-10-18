import api from '@/api'
import {
	FETCH_MARKET_SELLS
} from './types'

export function fetchMarketSells (userId) {
	return async function (dispatch) {
		const marketSells = (await api.get(`/users/${userId}/market-sells`)).data

		dispatch({ type: FETCH_MARKET_SELLS, marketSells })
	}
}
