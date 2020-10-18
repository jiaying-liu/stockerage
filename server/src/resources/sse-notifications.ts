import { Request, Response, NextFunction, Router } from 'express'
import Notification from '../entities/Notification'
import checkUserAccess from '../middlewares/user-access'

async function sendNotificationsToUser (userId: number, res: Response) {
	try {
		const notifications = await Notification.findByUserIdAndStatus(userId, 'unopened')

		res.write(`data: ${JSON.stringify(notifications)}\n\n`)
	} catch (error) {
		console.error(`Error while sending notification: ${error.message}`)
	}
}

// SSE
function getUserNotifications (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		})

		setInterval(() => sendNotificationsToUser(Number(userId), res), 2000)
	} catch (error) {
		console.error(`Error while getting user notifications: ${error.message}`)
		next(error)
	}
}

const router = Router({ mergeParams: true })

router.get('/:userId', checkUserAccess, getUserNotifications)

export default router
