import { FETCH_LIMIT_BUYS } from '@/actions/types'

export default function (state = [], action) {
	switch (action.type) {
		case FETCH_LIMIT_BUYS:
			return action.limitBuys
		default:
			return state
	}
}
