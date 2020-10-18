import { Request, Response, NextFunction, Router } from 'express'
import WatchListStock from '../entities/WatchListStock'
import User from '../entities/User'

async function getUserWatchListStocks (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const watchListStocks = await WatchListStock.findByUserId(Number(userId))

		res.json(watchListStocks)
	} catch (error) {
		console.error(`Error while getting user's watch list stocks: ${error.message}`)
		next(error)
	}
}

async function postUserWatchListStock (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const { symbol } = req.body
		const user = await User.findById(Number(userId))
		let watchListStock = new WatchListStock()

		watchListStock.symbol = symbol
		watchListStock.user = user
		watchListStock = await watchListStock.save()

		res.json({
			id: watchListStock.id
		})
	} catch (error) {
		console.error(`Error while creating user's watch list stock: ${error.message}`)
		next(error)
	}
}

async function deleteUserWatchListStock (req: Request, res: Response, next: NextFunction) {
	try {
		const { watchListStockId } = req.params
		const watchListStock = await WatchListStock.findById(Number(watchListStockId))

		if (watchListStock) {
			await watchListStock.remove()
		}

		res.sendStatus(204)
	} catch (error) {
		console.error(`Error while deleting user's watch list stock: ${error.message}`)
		next(error)
	}
}

const router = Router({ mergeParams: true })

router.get('/', getUserWatchListStocks)
router.post('/', postUserWatchListStock)
router.options('/', postUserWatchListStock)
router.delete('/:watchListStockId', deleteUserWatchListStock)

export default router
