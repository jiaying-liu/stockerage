import axios from 'axios'

export default async function iexCloud (path: string, params: {
	[param: string]: number | string | boolean
} = {}) {
	const apiPath = path.charAt(0) === '/' ? path.substring(1) : path
	const response = await axios.get(`${process.env.IEX_API_URL}/${apiPath}`, {
		params: {
			...params,
			token: process.env.IEX_TOKEN
		}
	})

	return response.data
}
