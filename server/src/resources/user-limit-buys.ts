import { Request, Response, NextFunction, Router } from 'express'
import User from '../entities/User'
import LimitBuy from '../entities/LimitBuy'
import Notification from '../entities/Notification'

async function getUserLimitBuys (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const limitBuys = await LimitBuy.findByUserId(Number(userId))

		res.json(limitBuys)
	} catch (error) {
		console.error(`Error while getting limit buys for user: ${error.message}`)
		next(error)
	}
}

async function postUserLimitBuys (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const { stockSymbol, quantity, limitPrice } = req.body
		const user = await User.findById(Number(userId))
		let limitBuy = new LimitBuy()

		limitBuy.stockSymbol = stockSymbol
		limitBuy.quantity = quantity
		limitBuy.limitPrice = limitPrice
		limitBuy.user = user
		limitBuy.value = quantity * limitPrice
		limitBuy = await limitBuy.save()
		Notification.createLimitBuyPlacedNotification(limitBuy)

		res.json({
			id: limitBuy.id
		})
	} catch (error) {
		console.error(`Error while creating Limit Buy for user: ${error.message}`)
		next(error)
	}
}

const router = Router({ mergeParams: true })

router.get('/', getUserLimitBuys)
router.post('/', postUserLimitBuys)
router.options('/', postUserLimitBuys)

export default router
