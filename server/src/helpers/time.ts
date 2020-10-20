import moment = require('moment-timezone')

export function isMarketHour () {
	const now = moment().tz('America/New_York')
	console.log('now is ', now.format('YYYY-MM-DD HH:mm'))
	const openHour = moment(`${now.format('YYYY-MM-DD')} 09:30`, 'YYYY-MM-DD HH:mm')
	console.log('open hour is', openHour.format('YYYY-MM-DD HH:mm'))
	const closeHour = moment(`${now.format('YYYY-MM-DD')} 16:00`, 'YYYY-MM-DD HH:mm')
	console.log('close hour is', closeHour.format('YYYY-MM-DD HH:mm'))

	return now.day() >= 1 && now.day() <= 5 && now.isBetween(openHour, closeHour, undefined, '[)')
}
