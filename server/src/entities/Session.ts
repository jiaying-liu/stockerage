import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import User from './User'

@Entity()
export default class Session extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	refreshToken: string

	@ManyToOne(() => User, user => user.sessions)
	user: User

	static findByRefreshToken (refreshToken: string) {
		return this.createQueryBuilder('session').where('session.refreshToken = :refreshToken', { refreshToken }).getMany()
	}
}
