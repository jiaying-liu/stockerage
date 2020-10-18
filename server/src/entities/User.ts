import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import Session from "./Session"
import NumericTransformer from './transformers/NumericTransformer'
import Stock from "./Stock";
import MarketBuy from "./MarketBuy";
import MarketSell from "./MarketSell";
import LimitBuy from "./LimitBuy";
import LimitSell from "./LimitSell";
import PortfolioCloseValue from "./PortfolioCloseValue";
import { quote } from "../services";
import Notification from "./Notification";
import WatchListStock from "./WatchListStock";

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
	email: string

	@Column('decimal',
		{
			precision: 10,
			scale: 2,
			default: 100000,
			transformer: new NumericTransformer()
		})
	balance: number
	
	@OneToMany(() => Session, session => session.user)
	sessions: Session[]

	@OneToMany(() => Stock, stock => stock.user)
	stocks: Stock[]

	@OneToMany(() => MarketBuy, marketBuy => marketBuy.user)
	marketBuys: MarketBuy[]

	@OneToMany(() => MarketSell, marketSell => marketSell.user)
	marketSells: MarketSell[]

	@OneToMany(() => LimitBuy, limitBuy => limitBuy.user)
	limitBuys: LimitBuy[]

	@OneToMany(() => LimitSell, limitSell => limitSell.user)
	limitSells: LimitSell[]

	@OneToMany(() => PortfolioCloseValue, portfolioCloseValue => portfolioCloseValue.user)
	portfolioCloseValues: PortfolioCloseValue[]

	@OneToMany(() => Notification, notification => notification.user)
	notifications: Notification[]

	@OneToMany(() => WatchListStock, watchListStock => watchListStock.user)
	watchListStocks: WatchListStock[]

  static findById (id: number) {
		return this.createQueryBuilder('user').where('user.id = :id', { id }).getOne()
	}
	
	static findByEmail (email: string) {
		return this.createQueryBuilder('user').where('user.email = :email', { email }).getMany()
	}

	toJson () {
		return {
			id: this.id,
			name: this.name,
			email: this.email,
			balance: this.balance
		}
	}

	async getPortfolioValue () {
		const stocks = await Stock.findStocksForUser(this.id)
		const stockQuotePromises = stocks.map(stock => quote(stock.symbol))
		const stockQuotes = await Promise.all(stockQuotePromises)
		const totalStockValue = stockQuotes.reduce((acc, stockQuote, index) => {
			const stock = stocks[index]
			const stockValue = stockQuote.latestPrice * stock.quantity

			return acc + stockValue
		}, 0)

		return this.balance + totalStockValue
	}
}
