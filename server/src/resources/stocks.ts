import { Request, Response, NextFunction, Router } from 'express'
import { symbols, Symbol, quote, company, keyStats, intradayPrices, chart } from '../services/iex'
import redisClient from '../helpers/redis-client'
import { promisify } from 'util'

let stocks: Symbol[] = []

async function getStocks (req: Request, res: Response, next: NextFunction) {
	try {
		if (!stocks.length) {
			stocks = await symbols()
		}

		res.json(stocks)
	} catch (error) {
		console.error(`Error while fetching stocks: ${error.message}`)
		next(error)
	}
}

async function getStockBySymbol (req: Request, res: Response, next: NextFunction) {
	try {
		const { symbol } = req.params
		const [stockCompany, stockQuote, stockKeyStats] = await Promise.all([company(symbol), quote(symbol), keyStats(symbol)])

		res.json({
			symbol: stockCompany.symbol,
			name: stockCompany.companyName,
			industry: stockCompany.industry,
			description: stockCompany.description,
			ceo: stockCompany.CEO,
			employees: stockCompany.employees,
			latestPrice: stockQuote.latestPrice,
			volume: stockQuote.volume,
			previousClose: stockQuote.previousClose,
			marketCap: stockKeyStats.marketcap,
			week52High: stockKeyStats.week52high,
			week52Low: stockKeyStats.week52low,
			avg10Volume: stockKeyStats.avg10Volume,
			dividendYield: stockKeyStats.dividendYield,
			peRatio: stockKeyStats.peRatio,
			nextEarningsDate: stockKeyStats.nextEarningsDate
		})
	} catch (error) {
		console.error(`Error while fetching stock: ${error.message}`)
		next(error)
	}
}

async function getStockSymbolChart (req: Request, res: Response, next: NextFunction) {
	try {
		const { symbol } = req.params
		const { timeRange } = req.query
		const timeRangeLowerCase = (timeRange as string).toLowerCase()
		const chartDataKey = `stock:${symbol}:chart:${timeRange}`.toLowerCase()
		const getKey = promisify(redisClient.get).bind(redisClient)

		if (['5d', '1m', '6m', '1y', '5y'].includes(timeRangeLowerCase)) {
			let chartData = []
			const cachedChartData = await getKey(chartDataKey)

			if (cachedChartData) {
				chartData = JSON.parse(cachedChartData)
			} else {
				const stockChart = await chart(symbol, timeRangeLowerCase)

				redisClient.set(chartDataKey, JSON.stringify(stockChart), 'EX', ['5d', '1m'].includes(timeRangeLowerCase) ? 30 : 60 * 60 * 24)
				chartData = stockChart
			}

			res.json(chartData)
		} else {
			const stockIntradayPrices = await intradayPrices(symbol)

			res.json(stockIntradayPrices)
		}
	} catch (error) {
		console.error(`Error while fetching stock chart data: ${error.message}`)
		next(error)
	}
}

const router = Router()

router.get('/', getStocks)
router.get('/:symbol', getStockBySymbol)
router.get('/:symbol/chart', getStockSymbolChart)

export default router
