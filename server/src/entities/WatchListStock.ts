import {
	BaseEntity,
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	Unique
} from 'typeorm'
import User from './User'

@Entity()
@Unique('UQ_WATCH_LIST_STOCK_SYMBOL_USER_ID', ['symbol', 'user'])
export default class WatchListStock extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	symbol: string

	@ManyToOne(() => User, user => user.watchListStocks)
	user: User

	static findByUserId (userId: number) {
		return this.createQueryBuilder('watchListStock').where('watchListStock.user = :userId', { userId }).getMany()
	}
	
	static findById (watchListId: number) {
		return this.createQueryBuilder('watchListStock').where('watchListStock.id = :watchListId', { watchListId }).getOne()
	}
}
