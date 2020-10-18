import api, { setAccessToken } from '@/api'
import {
	FETCH_CURRENT_USER,
	LOGOUT_CURRENT_USER
} from './types'

export function fetchCurrentUser () {
	return async function (dispatch) {
		const currentUser = (await api.get('/current-user')).data

		dispatch({ type: FETCH_CURRENT_USER, currentUser })
	}
}

export function logoutCurrentUser () {
	return async function (dispatch) {
		await api.post('/auth/logout')
		
		setAccessToken('')
		dispatch({ type: LOGOUT_CURRENT_USER })
	}
}
