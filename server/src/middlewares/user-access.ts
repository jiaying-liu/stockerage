import { Request, Response, NextFunction } from 'express'
import User from '../entities/User'

export default async function checkUserAccess (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const { user } = req

		if (!Number(userId)) {
			console.error(`Invalid user id found in params: ${userId}`)
			res.sendStatus(401)
		} else if (user.id !== Number(userId)) {
			console.error(`User does not have permissions to access endpoint`)
			res.sendStatus(403)
		} else {
			const userDb = await User.findById(Number(userId))

			if (!userDb) {
				console.error(`User does not exist!`)
				res.sendStatus(404)
			} else {
				next()
			}
		}
	} catch (error) {
		console.error(`Error while checking user access: ${error.message}`)
		res.sendStatus(500)
	}
}
