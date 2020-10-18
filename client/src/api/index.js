import axios from 'axios'

const api = axios.create({
	baseURL: process.env.REACT_APP_API_URL,
	withCredentials: true
})

function addRefreshTokenInterceptor () {
	const interceptor = api.interceptors.response.use(
		response => {
			return response
		},
		async error => {
			if (!error.response || error.response.status !== 401) {
				return Promise.reject(error)
			}

			// Prevent infinite loop
			api.interceptors.response.eject(interceptor)

			try {
				const accessTokenResponse = await api.post('/auth/refresh-token')
				const accessToken = accessTokenResponse.data.accessToken

				setAccessToken(accessToken)
				error.response.config.headers['Authorization'] = `Bearer ${accessToken}`

				return api(error.response.config)
			} catch (error) {
				api.post('/auth/logout')

				return Promise.reject(error)
			} finally {
				addRefreshTokenInterceptor()
			}
		}
	)
}

addRefreshTokenInterceptor()

export function setAccessToken (accessToken) {
	api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
}

export default api
