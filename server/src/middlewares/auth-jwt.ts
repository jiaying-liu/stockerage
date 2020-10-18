import jwt = require('jsonwebtoken')
import { Request, Response, NextFunction } from 'express'

export default function authJWT (req: Request, res: Response, next: NextFunction) {
	try {
		const authHeader = req.headers['authorization']
		const accessToken = authHeader && authHeader.split(' ')[1]
		const decodedToken: { userId: number } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET) as { userId: number }

		if (!decodedToken.userId) {
			throw new Error('Invalid access token')
		}
		
		req.user = { id: decodedToken.userId }

		next()
	} catch (error) {
		console.error(`Error while verifying access token: ${error.message}`)
		res.sendStatus(401)
	}
}
