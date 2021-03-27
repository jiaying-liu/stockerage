import { Entity, ManyToOne } from "typeorm";
import Order from "./Order";
import User from "./User";
import { quote } from "../services";
import Stock from "./Stock";
import Notification from "./Notification";

@Entity()
export default class MarketSell extends Order {
	@ManyToOne(() => User, user => user.marketSells)
	user: User

	static findByUserId (userId: number) {
		return this.createQueryBuilder('marketSell').where('marketSell.user = :userId', { userId }).getMany()
	}

	static findPendingOrders () {
		return this.createQueryBuilder('marketSell')
			.leftJoinAndSelect('marketSell.user', 'user')
			.where('marketSell.status = \'pending\'')
			.getMany()
	}

	async executeTrade () {
		const stockQuote = await quote(this.stockSymbol)
		const price = stockQuote.latestPrice
		const value = this.quantity * price
		const user = await User.findById(this.user.id)
		const stock = (await Stock.findBySymbolForUser(user.id, this.stockSymbol))[0]

		if (!stock || stock.quantity < this.quantity) {
			this.status = 'canceled'
			await this.save()
			throw new Error('User does not have enough stocks to sell')
		}

		stock.quantity -= this.quantity
		await stock.save()
		user.balance += value
		await user.save()
		this.status = 'filled'
		this.value = value
		const marketSell = await this.save()
		await Notification.createMarketSellFilledNotification(marketSell)

		return marketSell
	}

	async cancel () {
		this.status = 'canceled'
		const marketSell = await this.save()

		Notification.createMarketSellCanceledNotification(marketSell)

		return marketSell
	}

	async isOrderValid() {
		const stocks = (await Stock.findBySymbolForUser(this.user.id, this.stockSymbol));

		if (!stocks.length) {
			return false;
		}

		const stock = stocks[0];

		return stock.quantity >= this.quantity;
	}
}
