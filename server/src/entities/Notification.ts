import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Check, ManyToOne } from 'typeorm'
import User from './User'
import MarketBuy from './MarketBuy'
import * as d3 from 'd3-format'
import MarketSell from './MarketSell'
import LimitBuy from './LimitBuy'
import LimitSell from './LimitSell'

@Entity()
export default class Notification extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({
		type: 'timestamptz',
		default: () => 'CURRENT_TIMESTAMP'
	})
	createdDatetime: string

	@Column({
		default: 'unopened'
	})
	@Check('status in (\'unread\', \'read\', \'unsent\', \'unopened\')')
	status: 'unread' | 'read' | 'unsent' | 'unopened'

	@Column()
	title: string

	@Column()
	content: string

	@Column()
	stock: string

	@ManyToOne(() => User, user => user.notifications)
	user: User

	static findById (id: number) {
		return this.createQueryBuilder('notification').where('notification.id = :id', { id }).getOne()
	}

	static findByUserId (userId: number) {
		return this.createQueryBuilder('notification')
			.where('notification.user = :userId', { userId })
			.orderBy('notification.createdDatetime', 'DESC')
			.getMany()
	}

	static findBatchByUserId (userId: number, batchIndex: number = 0, batchSize: number = 10) {
		const skip = batchIndex * batchSize

		return this.createQueryBuilder('notification')
			.where('notification.user = :userId', { userId })
			.orderBy('notification.createdDatetime', 'DESC')
			.skip(skip)
			.take(batchSize)
			.getMany()
	}

	static findByUserIdAndStatus (userId: number, status: string) {
		return this.createQueryBuilder('notification')
			.where('notification.user = :userId', { userId })
			.andWhere('notification.status = :status', { status })
			.orderBy('notification.createdDatetime', 'DESC')
			.getMany()
	}

	static createNewNotification(title: string, content: string, stockSymbol: string, user: User) {
		let notification = new Notification();

		notification.status = 'unopened';
		notification.title = title;
		notification.content = content;
		notification.stock = stockSymbol;
		notification.user = user;

		return notification.save();
	}

	static async createMarketBuyFilledNotification (marketBuy: MarketBuy): Promise<Notification> {
		if (marketBuy.status !== 'filled') {
			throw new Error('Market Buy has not been filled')
		}
	
		let notification = new Notification()
		const marketBuyPrice = marketBuy.value / marketBuy.quantity
	
		notification.createdDatetime = new Date().toISOString()
		notification.status = 'unopened'
		notification.title = `${marketBuy.stockSymbol} Market Buy Order Filled`
		notification.content = `Your Market Buy Order of ${marketBuy.stockSymbol} has been filled at ${d3.format('$.2f')(marketBuyPrice)} per share.`
		notification.stock = marketBuy.stockSymbol
		notification.user = marketBuy.user
		notification = await notification.save()

		return notification
	}

	static async createMarketBuyPlacedNotification (marketBuy: MarketBuy): Promise<Notification> {
		if (marketBuy.status !== 'pending') {
			throw new Error('Market Buy should be pending')
		}

		let notification = new Notification()

		notification.createdDatetime = new Date().toISOString()
		notification.status = 'unopened'
		notification.title = `${marketBuy.stockSymbol} Market Buy Order Placed`
		notification.content = `Your Market Buy Order of ${marketBuy.stockSymbol} has been placed. It will be executed after the market opens at the next available price.`
		notification.stock = marketBuy.stockSymbol
		notification.user = marketBuy.user
		notification = await notification.save()

		return notification
	}

	static async createMarketSellPlacedNotification (marketSell: MarketSell) {
		if (marketSell.status !== 'pending') {
			throw new Error('Market Sell should be pending');
		}

		return this.createNewNotification(
			`${marketSell.stockSymbol} Market Sell Order Placed`,
			`Your Market Sell Order of ${marketSell.stockSymbol} has been placed. It will be executed after the market opens at the next available price`,
			marketSell.stockSymbol,
			marketSell.user
		);
	}

	static async createMarketSellFilledNotification (marketSell: MarketSell) {
		if (marketSell.status !== 'filled') {
			throw new Error('Market Sell has not been filled')
		}

		const notification = new Notification()
		const marketSellPrice = marketSell.value / marketSell.quantity

		// notification.createdDatetime = new Date().toISOString()
		notification.title = `${marketSell.stockSymbol} Market Sell Order Filled`
		notification.content = `Your Market Sell Order of ${marketSell.stockSymbol} has been filled at ${d3.format('$.2f')(marketSellPrice)} per share.`
		notification.stock = marketSell.stockSymbol
		notification.user = marketSell.user

		return notification.save()
	}

	static async createLimitBuyPlacedNotification (limitBuy: LimitBuy) {
		if (limitBuy.status !== 'pending') {
			throw new Error('Limit Buy is not pending')
		}

		const notification = new Notification()

		notification.title = `${limitBuy.stockSymbol} Limit Buy Order Placed`
		notification.content = `Your Limit Buy Order of ${limitBuy.stockSymbol} has been placed. It will be executed when the stock price becomes ${d3.format('$.2f')(limitBuy.limitPrice)} or lower. The Limit Buy Order will be canceled if not executed by the end of the trading day.`
		notification.stock = limitBuy.stockSymbol
		notification.user = limitBuy.user

		return notification.save()
	}

	static async createLimitBuyFilledNotification (limitBuy: LimitBuy) {
		if (limitBuy.status !== 'filled') {
			throw new Error('Limit Buy is not filled')
		}

		const notification = new Notification()
		const limitBuyPrice = limitBuy.value / limitBuy.quantity

		notification.title = `${limitBuy.stockSymbol} Limit Buy Order Filled`
		notification.content = `Your Limit Buy Order of ${limitBuy.stockSymbol} has been filled at ${d3.format('$.2f')(limitBuyPrice)} per share.`
		notification.stock = limitBuy.stockSymbol
		notification.user = limitBuy.user

		return notification.save()
	}

	static async createLimitSellPlacedNotification (limitSell: LimitSell) {
		if (limitSell.status !== 'pending') {
			throw new Error('Limit Sell is not pending')
		}

		const notification = new Notification()

		notification.title = `${limitSell.stockSymbol} Limit Sell Order Placed`
		notification.content = `Your Limit Sell Order of ${limitSell.stockSymbol} has been placed. It will be executed when the stock price becomes ${d3.format('$.2f')(limitSell.limitPrice)} or higher. The Limit Sell Order will be canceled if not executed by the end of the trading day.`
		notification.stock = limitSell.stockSymbol
		notification.user = limitSell.user

		return notification.save()
	}

	static async createLimitSellFilledNotification (limitSell: LimitSell) {
		if (limitSell.status !== 'filled') {
			throw new Error('Limit Sell is not filled')
		}

		const notification = new Notification()
		const limitSellPrice = limitSell.value / limitSell.quantity

		notification.title = `${limitSell.stockSymbol} Limit Sell Order Filled`
		notification.content = `Your Limit Sell Order of ${limitSell.stockSymbol} has been filled at ${d3.format('$.2f')(limitSellPrice)} per share.`
		notification.stock = limitSell.stockSymbol
		notification.user = limitSell.user

		return notification.save()
	}

	static async createMarketBuyCanceledNotification (marketBuy: MarketBuy) {
		const notification = new Notification()
		
		notification.title = `${marketBuy.stockSymbol} Market Buy Order Canceled`
		notification.content = `Your Market Buy Order of ${marketBuy.stockSymbol} has been canceled.`
		notification.stock = marketBuy.stockSymbol
		notification.user = marketBuy.user

		return notification.save()
	}

	static async createMarketSellCanceledNotification (marketSell: MarketSell) {
		const notification = new Notification()

		notification.title = `${marketSell.stockSymbol} Market Sell Order Canceled`
		notification.content = `Your Market Sell Order of ${marketSell.stockSymbol} has been canceled.`
		notification.stock = marketSell.stockSymbol
		notification.user = marketSell.user

		return notification.save()
	}

	static async createLimitBuyCanceledNotification (limitBuy: LimitBuy) {
		const notification = new Notification()

		notification.title = `${limitBuy.stockSymbol} Limit Buy Order Canceled`
		notification.content = `Your Limit Buy Order of ${limitBuy.stockSymbol} has been canceled.`
		notification.stock = limitBuy.stockSymbol
		notification.user = limitBuy.user

		return notification.save()
	}

	static async createLimitSellCanceledNotification (limitSell: LimitSell) {
		const notification = new Notification()

		notification.title = `${limitSell.stockSymbol} Limit Sell Order Canceled`
		notification.content = `Your Limit Sell Order of ${limitSell.stockSymbol} has been canceled.`
		notification.stock = limitSell.stockSymbol
		notification.user = limitSell.user

		return notification.save()
	}
}
