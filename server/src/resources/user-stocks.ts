import { Request, Response, NextFunction, Router } from 'express'
import Stock from '../entities/Stock'

async function getUserStocks (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const stocks = await Stock.findStocksForUser(Number(userId))

		res.json(stocks)
	} catch (error) {
		console.error(`Error while getting user's stocks: ${error.message}`)
		next(error)
	}
}

async function getUserStockBySymbol (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId, symbol } = req.params
		const stocks = await Stock.findBySymbolForUser(Number(userId), symbol)

		res.json(stocks)
	} catch (error) {
		console.error(`Error while getting user's stock for by symbol: ${error.message}`)
		next(error)
	}
}

const router = Router({ mergeParams: true })

router.get('/', getUserStocks)
router.get('/:symbol', getUserStockBySymbol)

export default router
