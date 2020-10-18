import { FETCH_LIMIT_SELLS } from '@/actions/types'

export default function (state = [], action) {
	switch (action.type) {
		case FETCH_LIMIT_SELLS:
			return action.limitSells
		default:
			return state
	}
}
