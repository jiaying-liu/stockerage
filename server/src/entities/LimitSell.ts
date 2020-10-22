import { Entity, Column, ManyToOne } from "typeorm";
import NumericTransformer from "./transformers/NumericTransformer";
import User from "./User";
import Order from './Order'
import { quote } from '../services/iex'
import Stock from "./Stock";
import Notification from "./Notification";

@Entity()
export default class LimitSell extends Order {
	@Column('decimal', {
		precision: 10,
		scale: 2,
		transformer: new NumericTransformer()
	})
	limitPrice: number

	@ManyToOne(() => User, user => user.limitSells)
	user: User

	static findByUserId (userId: number) {
		return this.createQueryBuilder('limitSell').where('limitSell.user = :userId', { userId }).getMany()
	}

	static findPendingOrders () {
		return this.createQueryBuilder('limitSell')
			.leftJoinAndSelect('limitSell.user', 'user')
			.where('limitSell.status = \'pending\'')
			.getMany()
	}

	async executeTrade (currentStockPrice?: number) {
		const stockPrice = currentStockPrice || (await quote(this.stockSymbol)).latestPrice

		if (stockPrice < this.limitPrice) {
			return this
		}

		const value = this.quantity * stockPrice
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
		const limitSell = await this.save()

		Notification.createLimitSellFilledNotification(limitSell)

		return limitSell
	}

	async cancel () {
		this.status = 'canceled'
		const limitSell = await this.save()

		Notification.createLimitSellCanceledNotification(limitSell)

		return limitSell
	}
}
