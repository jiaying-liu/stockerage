import moment = require('moment-timezone')

function isTimeWithinMarketHour (momentObj: moment.Moment) {
	const hour = momentObj.hour()
	const minute = momentObj.minute()
	const day = momentObj.day()
	const isWeekday = day >= 1 && day <= 5
	const isTimeValid = (hour === 9 && minute >= 30) || (hour >= 10 && hour <= 23 && minute <= 59)

	return isWeekday && isTimeValid
}

export function isMarketHour () {
	const now = moment().tz('America/New_York')
	console.log('now is ', now.format('YYYY-MM-DD HH:mm'))
	const openHour = moment(`${now.format('YYYY-MM-DD')} 09:30`, 'YYYY-MM-DD HH:mm', 'America/New_York')
	console.log('open hour is', openHour.format('YYYY-MM-DD HH:mm'))
	const closeHour = moment(`${now.format('YYYY-MM-DD')} 23:59`, 'YYYY-MM-DD HH:mm', 'America/New_York')
	console.log('close hour is', closeHour.format('YYYY-MM-DD HH:mm'))
	const isBetween = now.isBetween(openHour, closeHour, undefined, '[)')
	console.log('is between is', isBetween)
	console.log('hour is ', now.hour())
	console.log('minute is ', now.minute())
	const value = now.day() >= 1 && now.day() <= 5 && now.isBetween(openHour, closeHour, undefined, '[)')
	console.log('now day is', now.day())
	console.log('now')
	console.log('value is', value)

	// return value

	return isTimeWithinMarketHour(now)
}
