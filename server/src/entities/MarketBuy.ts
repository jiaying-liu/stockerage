import { Entity, ManyToOne } from "typeorm";
import Order from "./Order";
import User from "./User";
import Stock from './Stock'
import Notification from './Notification'
import { quote } from '../services/iex'

@Entity()
export default class MarketBuy extends Order {
	@ManyToOne(() => User, user => user.marketBuys)
	user: User

	static findByUserId (userId: number) {
		return this.createQueryBuilder('marketBuy').where('marketBuy.user = :userId', { userId }).getMany()
	}

	static findPendingOrders () {
		return this.createQueryBuilder('marketBuy')
			.leftJoinAndSelect('marketBuy.user', 'user')
			.where('marketBuy.status = \'pending\'').getMany()
	}

	async executeTrade () {
		const stockSymbol = this.stockSymbol
		const quantity = this.quantity
		const stockQuote = await quote(stockSymbol)
		const price = stockQuote.latestPrice
		const value = quantity * price
		const user = await User.findById(this.user.id)
	
		if (user.balance < value) {
			this.status = 'canceled'
			await this.save()
			throw new Error('User does not have enough funds to make order')
		}
	
		let stock = (await Stock.findBySymbolForUser(user.id, stockSymbol))[0]

		if (!stock) {
			stock = new Stock()
			stock.user = user
			stock.symbol = stockSymbol
			stock.quantity = 0
			stock.avgCost = 0
		}
	
		stock.addShares(price, quantity)
		await stock.save()
		user.balance -= value
		await user.save()
		this.status = 'filled'
		this.value = value
		const marketBuy = await this.save()
		Notification.createMarketBuyFilledNotification(marketBuy)

		return marketBuy
	}

	async cancel () {
		this.status = 'canceled'

		const marketBuy = await this.save()

		Notification.createMarketBuyCanceledNotification(marketBuy)

		return marketBuy
	}
}
