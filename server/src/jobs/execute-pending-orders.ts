import MarketBuy from '../entities/MarketBuy'
import MarketSell from '../entities/MarketSell'
import LimitBuy from '../entities/LimitBuy'
import { quote } from '../services/iex'
import LimitSell from '../entities/LimitSell'

export async function executePendingMarketBuys () {
	const marketBuys = await MarketBuy.findPendingOrders()

	for (let i = 0; i < marketBuys.length; i++) {
		const marketBuy = marketBuys[i];
		try {
			await marketBuy.executeTrade();
		} catch (error) {
			console.error(`Error while executing market buy: ${error.message}`);
			marketBuy.cancel();
		}
	}
}

export async function executePendingMarketSells () {
	const marketSells = await MarketSell.findPendingOrders();

	for (let i = 0; i < marketSells.length; i++) {
		const marketSell = marketSells[i];

		try {
			await marketSell.executeTrade();
		} catch (error) {
			console.error(`Error while executing market sell: ${error.message}`);
			marketSell.cancel();
		}
	}
}

async function executeLimitOrder (limitOrder: LimitBuy | LimitSell, stockToPriceMap: { [stock: string]: number }) {
	try {
		const price = stockToPriceMap[limitOrder.stockSymbol.toLowerCase()]

		await limitOrder.executeTrade(price)
	} catch (error) {
		console.error(`Error while executing limit buy: ${error.message}`)
		limitOrder.cancel()
	}
}

export async function executePendingLimitOrders () {
	const limitBuys = await LimitBuy.findPendingOrders()
	const limitSells = await LimitSell.findPendingOrders()
	const stockSet = new Set<string>()

	limitBuys.forEach(limitBuy => {
		stockSet.add(limitBuy.stockSymbol.toLowerCase())
	})
	limitSells.forEach(limitSell => {
		stockSet.add(limitSell.stockSymbol.toLowerCase())
	})

	const stockQuotes = await Promise.all(Array.from(stockSet).map(stock => quote(stock)))
	const stockToPriceMap = stockQuotes.reduce((acc, stockQuote) => {
		acc[stockQuote.symbol.toLowerCase()] = stockQuote.latestPrice

		return acc
	}, {} as {
		[stock: string]: number
	})

	for (let i = 0; i < limitBuys.length; i++) {
		await executeLimitOrder(limitBuys[i], stockToPriceMap);
	}
	
	for (let i = 0; i < limitSells.length; i++) {
		await executeLimitOrder(limitSells[i], stockToPriceMap);
	}
}

export async function cancelPendingLimitOrders () {
	const limitBuys = await LimitBuy.findPendingOrders()
	const limitSells = await LimitSell.findPendingOrders()

	limitBuys.forEach(async limitBuy => {
		try {
			await limitBuy.cancel()
		} catch (error) {
			console.error(`Error while canceling limit buy: ${error.message}`)
		}
	})

	limitSells.forEach(async limitSell => {
		try {
			await limitSell.cancel()
		} catch (error) {
			console.error(`Error while canceling limit sell: ${error.message}`)
		}
	})
}
