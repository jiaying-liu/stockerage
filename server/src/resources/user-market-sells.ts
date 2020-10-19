import { Request, Response, NextFunction, Router } from "express";
import User from "../entities/User";
import MarketSell from "../entities/MarketSell";
import { isMarketHour } from "../helpers/time";

async function getUserMarketSells (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const marketSells = await MarketSell.findByUserId(Number(userId))

		res.json(marketSells)
	} catch (error) {
		console.error(`Error while getting market sells for user: ${error.message}`)
		next(error)
	}
}

async function postUserMarketSells (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const { stockSymbol, quantity } = req.body
		const user = await User.findById(Number(userId))

		if (!user) {
			throw new Error(`User with id ${userId} does not exist!`)
		}

		let marketSell = new MarketSell()

		marketSell.stockSymbol = stockSymbol
		marketSell.quantity = quantity
		marketSell.user = user
		marketSell.datetime = new Date().toISOString()
		marketSell = await marketSell.save()

		// If during market hours, immediately execute trade. Otherwise, wait until next trading day
		if (isMarketHour()) {
			await marketSell.executeTrade()
		}

		res.json({
			id: marketSell.id
		})
	} catch (error) {
		console.error(`Error while creating Market Sell for user: ${error.message}`)
		next(error)
	}
}

const router = Router({ mergeParams: true })

router.get('/', getUserMarketSells)
router.post('/', postUserMarketSells)
router.options('/', postUserMarketSells)

export default router
