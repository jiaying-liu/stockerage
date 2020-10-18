import { FETCH_MARKET_BUYS  } from '@/actions/types'

export default function (state = [], action) {
	switch (action.type) {
		case FETCH_MARKET_BUYS:
			return action.marketBuys
		default:
			return state
	}
}
