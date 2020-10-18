import { Request, Response, NextFunction, Router } from 'express'
import Notification from '../entities/Notification'

async function getUserNotifications (req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = req.params
		const { batchIndex, batchSize } = req.query
		const notifications = await Notification.findBatchByUserId(Number(userId), Number(batchIndex || 0), Number(batchSize || 10))

		res.json(notifications)
	} catch (error) {
		console.error(`Error while getting user notifications: ${error.message}`)
		next(error)
	}
}

async function putUserNotification (req: Request, res: Response, next: NextFunction) {
	try {
		const { notificationId } = req.params
		const { status } = req.body
		const notification = await Notification.findById(Number(notificationId))

		if (!notification) {
			res.sendStatus(404)
		} else {
			notification.status = status
			await notification.save()

			res.sendStatus(204)
		}
	} catch (error) {
		console.error(`Error while performing PUT request for use notification: ${error.message}`)
		next(error)
	}
}

const router = Router({ mergeParams: true })

router.get('/', getUserNotifications)
router.put('/:notificationId', putUserNotification)

export default router
