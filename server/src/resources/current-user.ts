import { Request, Response, NextFunction, Router } from 'express'
import User from '../entities/User'

async function currentUser (req: Request, res: Response, next: NextFunction) {
	try {
		const user = await User.findById(req.user.id)

		res.json(user.toJson())
	} catch (error) {
		console.error(`Error while retrieving current user: ${error.message}`)
		next(error)
	}
}

const router = Router()

router.get('/', currentUser)

export default router
