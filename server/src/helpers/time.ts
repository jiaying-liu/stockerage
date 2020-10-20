import moment = require('moment-timezone')

function isTimeWithinMarketHour (momentObj: moment.Moment) {
	const hour = momentObj.hour()
	const minute = momentObj.minute()
	const day = momentObj.day()
	const isWeekday = day >= 1 && day <= 5
	const isTimeValid = (hour === 9 && minute >= 30) || (hour >= 10 && hour < 16)

	return isWeekday && isTimeValid
}

export function isMarketHour () {
	const now = moment().tz('America/New_York')

	return isTimeWithinMarketHour(now)
}
