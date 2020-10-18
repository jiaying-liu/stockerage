import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, Check } from "typeorm";
import NumericTransformer from "./transformers/NumericTransformer";

@Entity()
export default abstract class Order extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	stockSymbol: string

	@Column()
	quantity: number

	@Column({
		default: 'pending'
	})
	@Check('status in (\'filled\', \'pending\', \'canceled\')')
	status: 'filled' | 'pending' | 'canceled'

	@Column('decimal', {
		precision: 10,
		scale: 2,
		transformer: new NumericTransformer(),
		nullable: true,
		default: null
	})
	value: number

	@Column({
		type: 'timestamptz',
		default: () => 'CURRENT_TIMESTAMP'
	})
	datetime: string

	abstract executeTrade (): Promise<Order>

	abstract cancel (): Promise<Order>
}
