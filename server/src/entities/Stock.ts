import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm'
import User from './User'
import NumericTransformer from './transformers/NumericTransformer'

@Entity()
@Unique('UQ_STOCK_SYMBOL_USER_ID', ['symbol', 'user'])
export default class Stock extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	symbol: string

	@Column({
		default: 0
	})
	quantity: number

	@Column('decimal', {
		precision: 10,
		scale: 2,
		transformer: new NumericTransformer(),
		default: 0
	})
	avgCost: number

	@ManyToOne(() => User, user => user.stocks)
	user: User

	static findBySymbolForUser (userId: number, symbol: string) {
		return this.createQueryBuilder('stock').where('stock.user = :userId and lower(stock.symbol) = lower(:symbol)', { userId, symbol }).getMany()
	}

	static findStocksForUser (userId: number) {
		return this.createQueryBuilder('stock').where('stock.user = :userId', { userId }).getMany()
	}

	addShares (stockPrice: number, quantity: number) {
		const currentTotalCost = this.avgCost * this.quantity

		this.quantity += quantity
		this.avgCost = (currentTotalCost + (stockPrice * quantity)) / this.quantity
	}
}
