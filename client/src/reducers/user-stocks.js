import { FETCH_USER_STOCKS } from '@/actions/types'

export default function (state = [], action) {
	switch (action.type) {
		case FETCH_USER_STOCKS:
			return action.userStocks
		default:
			return state
	}
}
