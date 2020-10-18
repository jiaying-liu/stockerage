import moment = require('moment-timezone')

export function isMarketHour () {
	const now = moment().tz('America/New_York')
	const openHour = moment(`${now.format('YYYY-MM-DD')} 09:30`, 'YYYY-MM-DD HH:mm')
	const closeHour = moment(`${now.format('YYYY-MM-DD')} 16:00`, 'YYYY-MM-DD HH:mm')

	return now.day() >= 1 && now.day() <= 5 && now.isBetween(openHour, closeHour, undefined, '[)')
}
