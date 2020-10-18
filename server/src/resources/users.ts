import { Request, Response, NextFunction, Router } from 'express'
import User from '../entities/User'
import PortfolioCloseValue from '../entities/PortfolioCloseValue'
import checkUserAccess from '../middlewares/user-access'
import moment = require('moment-timezone')
import momentBusiness = require('moment-business')

async function getUserPortfolioValue (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const user = await User.findById(Number(userId))

		if (!user) {
			throw new Error(`User with id ${userId} does not exist!`)
		}

		const portfolioValue = await user.getPortfolioValue()

		res.json({ portfolioValue })
	} catch (error) {
		console.error(`Error while getting user portfolio value: ${error.message}`)
		next(error)
	}
}

function getRangeStartDate (range: string) {
	const now = moment()
	switch (range) {
		case '1m':
			return now.subtract(1, 'M')
		case '6m':
			return now.subtract(6, 'M')
		case '1y':
			return now.subtract(1, 'y')
		default:
			return momentBusiness.subtractWeekDays(now, 5)
	}
}

async function getUserPortfolioCloseValueRange (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId, range } = req.params
		const rangeLowerCase = range.toLowerCase()
		let portfolioCloseValues: PortfolioCloseValue[]

		if (rangeLowerCase === 'all') {
			portfolioCloseValues = await PortfolioCloseValue.findAllCloseValuesForUser(Number(userId))
		} else {
			const startDate = getRangeStartDate(rangeLowerCase)

			portfolioCloseValues = await PortfolioCloseValue.findCloseValuesFromStartRange(Number(userId), startDate.format('YYYY-MM-DD'))
		}

		res.json(portfolioCloseValues.map(portfolioCloseValue => ({
			date: moment(portfolioCloseValue.datetime).format('YYYY-MM-DD'),
			value: portfolioCloseValue.value
		})))
	} catch (error) {
		console.error(`Error while gtting user's portfolio close value range: ${error.messsage}`)
		next(error)
	}
}

async function getUserPortfolioCloseValue (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const { date } = req.query

		let portfolioCloseValue: PortfolioCloseValue

		if (date) {
			portfolioCloseValue = await PortfolioCloseValue.findCloseValueForUserByDate(Number(userId), date as string)
		} else {
			portfolioCloseValue = await PortfolioCloseValue.findLatestCloseValueForUser(Number(userId))
		}

		if (!portfolioCloseValue) {
			res.status(404)
			res.send('Portfolio Close Value for given date not found')
		} else {
			res.json({ closeValue: portfolioCloseValue.value })
		}
	} catch (error) {
		console.error(`Error while getting user portfolio close value: ${error.message}`)
		next(error)
	}
}

const router = Router()

router.get('/:userId/portfolio/value', checkUserAccess, getUserPortfolioValue)
router.get('/:userId/portfolio/close-value', checkUserAccess, getUserPortfolioCloseValue)
router.get('/:userId/portfolio/close-value/range/:range', getUserPortfolioCloseValueRange)

export default router
