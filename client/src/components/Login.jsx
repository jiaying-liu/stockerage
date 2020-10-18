import React, { useEffect, useCallback } from 'react'
import { GoogleLogin } from 'react-google-login'

import api, { setAccessToken } from '@/api'
import { useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCurrentUser } from '@/actions/current-user'

export default function Login () {
	const currentUser = useSelector(state => state.currentUser)
	const history = useHistory()
	const dispatch = useDispatch()
	const stableDispatch = useCallback(dispatch, [])

	useEffect(() => {
		stableDispatch(fetchCurrentUser())
	}, [stableDispatch])

	useEffect(() => {
		if (currentUser) {
			history.push('/')
		}
	}, [currentUser, history])

	async function onGoogleSuccess (response) {
		try {
			const loginResponse = await api.post(`/auth/login`, {
				idToken: response.tokenObj.id_token
			})

			setAccessToken(loginResponse.data.accessToken)
			dispatch(fetchCurrentUser())
		} catch (error) {
			console.error(`Error while getting google response: ${error.message}`)
		}
	}

	function onGoogleFailure (response) {
		console.error(response)
	}

	return (
		<div>
			<h1>Stock Market Simulator</h1>
			<GoogleLogin
				clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
				buttonText='Login with Google'
				onSuccess={onGoogleSuccess}
				onFailure={onGoogleFailure}
				cookiePolicy='single_host_origin'
			/>
		</div>
	)
}
