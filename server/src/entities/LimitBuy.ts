import { Entity, Column, ManyToOne } from "typeorm";
import Order from "./Order";
import NumericTransformer from "./transformers/NumericTransformer";
import User from "./User";
import { quote } from '../services/iex'
import Stock from "./Stock";
import Notification from "./Notification";

@Entity()
export default class LimitBuy extends Order {
	@Column('decimal', {
		precision: 10,
		scale: 2,
		transformer: new NumericTransformer()
	})
	limitPrice: number

	@ManyToOne(() => User, user => user.limitBuys)
	user: User

	static findByUserId (userId: number) {
		return this.createQueryBuilder('limitBuy').where('limitBuy.user = :userId', { userId }).getMany()
	}

	static findPendingOrders () {
		return this.createQueryBuilder('limitBuy')
			.leftJoinAndSelect('limitBuy.user', 'user')
			.where('limitBuy.status = \'pending\'')
			.getMany()
	}

	async executeTrade (currentStockPrice?: number) {
		// return Promise.resolve(this)
		const stockPrice = currentStockPrice || (await quote(this.stockSymbol)).latestPrice

		if (stockPrice > this.limitPrice) {
			return this
		}

		const value = this.quantity * stockPrice

		if (this.user.balance < value) {
			this.status = 'canceled'
			await this.save()
			throw new Error('User does not have enough funds to make order')
		}

		let stock = (await Stock.findBySymbolForUser(this.user.id, this.stockSymbol))[0]

		if (!stock) {
			stock = new Stock()
			stock.user = this.user
			stock.symbol = this.stockSymbol
			stock.quantity = 0
			stock.avgCost = 0
		}

		stock.addShares(stockPrice, this.quantity)
		await stock.save()
		this.user.balance -= value
		await this.user.save()
		this.status = 'filled'
		this.value = value
		
		const limitBuy = await this.save()
		Notification.createLimitBuyFilledNotification(limitBuy)

		return limitBuy
	}

	async cancel () {
		this.status = 'canceled'

		const limitBuy = await this.save()
		
		Notification.createLimitBuyCanceledNotification(limitBuy)

		return limitBuy
	}
}
