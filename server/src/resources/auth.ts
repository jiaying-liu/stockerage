import * as express from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt = require('jsonwebtoken')
import User from '../entities/User'
import Session from '../entities/Session'

async function login (req: express.Request, res: express.Response, next: express.NextFunction) {
	const { idToken } = req.body
	const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

	try {
		const ticket = await client.verifyIdToken({
			idToken,
			audience: [process.env.GOOGLE_CLIENT_ID]
		})
		const payload = ticket.getPayload()
		const users = await User.findByEmail(payload.email)
		let user: User

		if (!users.length) {
			user = new User()
			user.name = payload.name
			user.email = payload.email

			user = await user.save()
		} else {
			user = users[0]
		}

		const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: '15m'
		})
		const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET)
		const session = new Session()

		session.refreshToken = refreshToken
		session.user = user
		await session.save()

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 365 * 1000,
			domain: process.env.COOKIE_DOMAIN,
			sameSite: 'none'
		})
		res.json({ accessToken })
	} catch (error) {
		console.error(`Cannot verify token with Google: ${error.message}`)
		next(error)
	}
}

async function refreshToken (req: express.Request, res: express.Response, next: express.NextFunction) {
	try {
		const cookies = req.cookies
		const refreshToken = cookies['refreshToken']
		const sessions = await Session.findByRefreshToken(refreshToken)
	
		if (!sessions.length) {
			res.send(401)
		}
	
		const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as { userId: number }

		if (!decodedRefreshToken.userId) {
			res.send(401)
		}

		const accessToken = jwt.sign({ userId: decodedRefreshToken.userId }, process.env.ACCESS_TOKEN_SECRET)

		res.json({
			accessToken
		})
	} catch (error) {
		console.error(`Error while refreshing access token: ${error.message}`)
		next(error)
	}
}

async function logout (req: express.Request, res: express.Response, next: express.NextFunction) {
	try {
		const refreshToken = req.cookies['refreshToken']

		if (refreshToken) {
			const sessions = await Session.findByRefreshToken(refreshToken)

			if (sessions.length) {
				await sessions[0].remove()
			}
		}

		res.clearCookie('refreshToken')
		res.sendStatus(204)
	} catch (error) {
		console.error(`Error during logout: ${error.message}`)
		next(error)
	}
}

const router = express.Router()

router.post('/login', login)
router.options('/login', login)
router.post('/logout', logout)
router.options('/logout', logout)
router.post('/refresh-token', refreshToken)

export default router
