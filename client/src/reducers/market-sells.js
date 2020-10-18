import { FETCH_MARKET_SELLS } from '@/actions/types'

export default function (state = [], action) {
	switch (action.type) {
		case FETCH_MARKET_SELLS:
			return action.marketSells
		default:
			return state
	}
}
