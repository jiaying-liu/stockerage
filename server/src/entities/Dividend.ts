import { Entity, ManyToOne, BaseEntity, PrimaryGeneratedColumn, Column, Check } from 'typeorm';
import User from './User';
import Notification from './Notification';
import NumericTransformer from './transformers/NumericTransformer';

@Entity()
export default class Dividend extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	stock: string;

	@Column('decimal', {
		precision: 10,
		scale: 2,
		transformer: new NumericTransformer(),
		default: 0
	})
	amountPerShare: number;

	@Column()
	numShares: number;

	@Column({
		default: 'pending'
	})
	@Check('status in (\'paid\', \'pending\')')
	status: 'pending' | 'paid';

	@Column({
		type: 'date'
	})
	exDividendDate: string;

	@Column({
		type: 'date'
	})
	paymentDate: string;

	@ManyToOne(() => User, user => user.dividends)
	user: User;

	static findDividendsForUser (userId: number) {
		return this.createQueryBuilder('dividend').where('dividend.user = :userId', { userId }).getMany();
	}
}
