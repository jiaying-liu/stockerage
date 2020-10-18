import { Request, Response, NextFunction, Router } from "express";
import User from "../entities/User";
import MarketBuy from "../entities/MarketBuy";
import Notification from '../entities/Notification'
import { quote } from '../services/iex'
import { isMarketHour } from "../helpers/time";

async function getUserMarketBuys (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const marketBuys = await MarketBuy.findByUserId(Number(userId))

		res.json(marketBuys)
	} catch (error) {
		console.error(`Error while getting market buys for user: ${error.message}`)
		next(error)
	}
}

async function postUserMarketBuys (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const { stockSymbol, quantity } = req.body
		const user = await User.findById(Number(userId))

		if (!user) {
			throw new Error(`User with id ${userId} does not exist!`)
		}

		let marketBuy = new MarketBuy()

		marketBuy.stockSymbol = stockSymbol
		marketBuy.quantity = quantity
		marketBuy.user = user
		marketBuy.datetime = new Date().toISOString()

		if (!isMarketHour()) {
			marketBuy = await marketBuy.save()
			await marketBuy.executeTrade()
		} else {
			// Create a market buy that will be executed on next trading day
			const stockPrice = (await quote(stockSymbol)).latestPrice

			marketBuy.value = stockPrice * quantity

			if (user.balance < marketBuy.value * 1.05) {
				throw new Error('User does not have enough funds to cover the market buy')
			}

			marketBuy = await marketBuy.save()
			Notification.createMarketBuyPlacedNotification(marketBuy)
		}

		res.json({
			id: marketBuy.id
		})
	} catch (error) {
		console.error(`Error while creating Market Buy for user: ${error.message}`)
		next(error)
	}
}

const router = Router({ mergeParams: true })

router.get('/', getUserMarketBuys)
router.post('/', postUserMarketBuys)
router.options('/', postUserMarketBuys)

export default router
