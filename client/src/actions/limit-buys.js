import api from '@/api'
import { FETCH_LIMIT_BUYS } from './types'

export function fetchLimitBuys (userId) {
	return async function (dispatch) {
		const limitBuys = (await api.get(`/users/${userId}/limit-buys`)).data

		dispatch({ type: FETCH_LIMIT_BUYS, limitBuys })
	}
}
