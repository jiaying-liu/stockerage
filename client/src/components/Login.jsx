import React, { useEffect, useCallback } from 'react'
import { GoogleLogin } from 'react-google-login'
import { IconButton } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons'

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
		<div style={{ textAlign: 'center', marginTop: '96px' }}>
			<h1>Stockerage</h1>
			<h3>
				Welcome to Stockerage, a paper trading platform where you can simulate the act of buying and selling stocks
			</h3>
			<GoogleLogin
				clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
				buttonText='Login/Signup with Google'
				onSuccess={onGoogleSuccess}
				onFailure={onGoogleFailure}
				cookiePolicy='single_host_origin'
			/>
			<div style={{ paddingTop: '16px' }}>
				<a
					href="https://github.com/jiaying-liu/stockerage"
					target="_blank"
					rel="noopener noreferrer"
				>
					<IconButton style={{ color: 'black' }}>
						<FontAwesomeIcon icon={faGithub} size="2x" />
					</IconButton>
				</a>
			</div>
		</div>
	)
}
