import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import User from './User'
import NumericTransformer from './transformers/NumericTransformer'

@Entity()
export default class PortfolioCloseValue extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column('decimal', {
		precision: 10,
		scale: 2,
		transformer: new NumericTransformer()
	})
	value: number

	@Column('timestamptz')
	datetime: string

	@ManyToOne(() => User, user => user.portfolioCloseValues)
	user: User

	static findLatestCloseValueForUser (userId: number) {
		return this.createQueryBuilder('portfolioCloseValue').where('portfolioCloseValue.user = :userId', { userId }).orderBy('portfolioCloseValue.datetime', 'DESC').getOne()
	}

	static findAllCloseValuesForUser (userId: number) {
		return this.createQueryBuilder('portfolioCloseValue').where('portfolioCloseValue.user = :userId', { userId }).orderBy('portfolioCloseValue.datetime').getMany()
	}

	static findCloseValueForUserByDate (userId: number, date: string) {
		return this.createQueryBuilder('portfolioCloseValue').where('portfolioCloseValue.user = :userId and date(portfolioCloseValue.datetime) = :date', { userId, date }).getOne()
	}

	static findCloseValuesFromStartRange (userId: number, startDate: string) {
		return this.createQueryBuilder('portfolioCloseValue').where('portfolioCloseValue.user = :userId and date(portfolioCloseValue.datetime) >= :startDate', { userId, startDate }).orderBy('portfolioCloseValue.datetime').getMany()
	}
}
