import api from '@/api'
import { FETCH_LIMIT_SELLS } from './types'

export function fetchLimitSells (userId) {
	return async function (dispatch) {
		const limitSells = (await api.get(`/users/${userId}/limit-sells`)).data

		dispatch({ type: FETCH_LIMIT_SELLS, limitSells })
	}
}
