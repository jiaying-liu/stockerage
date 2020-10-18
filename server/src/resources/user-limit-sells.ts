import { Request, Response, NextFunction, Router } from 'express'
import User from '../entities/User'
import LimitSell from '../entities/LimitSell'
import Notification from '../entities/Notification'

async function getUserLimitSells (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const limitSells = await  LimitSell.findByUserId(Number(userId))

		res.json(limitSells)
	} catch (error) {
		console.error(`Error while getting limit sells for user: ${error.message}`)
		next(error)
	}
}

async function postUserLimitSells (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const { stockSymbol, quantity, limitPrice } = req.body
		const user = await User.findById(Number(userId))
		let limitSell = new LimitSell()

		limitSell.stockSymbol = stockSymbol
		limitSell.quantity = quantity
		limitSell.limitPrice = limitPrice
		limitSell.user = user
		limitSell.value = quantity * limitPrice
		limitSell = await limitSell.save()
		
		Notification.createLimitSellPlacedNotification(limitSell)

		res.json({
			id: limitSell.id
		})
	} catch (error) {
		console.error(`Error while creating Limit Sell for user: ${error.message}`)
		next(error)
	}
}

const router = Router({ mergeParams: true })

router.get('/', getUserLimitSells)
router.post('/', postUserLimitSells)
router.options('/', postUserLimitSells)

export default router
