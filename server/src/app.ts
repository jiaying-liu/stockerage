require('dotenv').config()
require('newrelic')

import "reflect-metadata";
import { createConnection } from "typeorm";
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver'
import express = require('express')
import auth from './resources/auth'
import currentUser from './resources/current-user'
import users from './resources/users'
import userMarketBuys from './resources/user-market-buys'
import userMarketSells from './resources/user-market-sells'
import userLimitBuys from './resources/user-limit-buys'
import userLimitSells from './resources/user-limit-sells'
import userStocks from './resources/user-stocks'
import userWatchListStocks from './resources/user-watch-list-stocks'
import userNotifications from './resources/user-notifications'
import sseNotifications from './resources/sse-notifications'
import stocks from './resources/stocks'
import cors = require('cors')
import cookieParser = require('cookie-parser')
import authJWT from './middlewares/auth-jwt'
import checkUserAccess from './middlewares/user-access'
import schedule = require('node-schedule')
import recordPortfolioCloseValues from "./jobs/record-portfolio-close-values"
import {
	executePendingMarketBuys,
	executePendingMarketSells,
	executePendingLimitOrders,
	cancelPendingLimitOrders
} from "./jobs/execute-pending-orders"

async function startServer () {
	try {
		const connection = await createConnection({
			type: 'postgres',
			url: process.env.DATABASE_URL,
			synchronize: true, // TODO: need this to be set to true in order for db to sync
			// with entities. May need to find a way to disable this in production as it could
			// cause data loss.
			logging: ['error', 'warn'],
			entities: ['build/entities/**/*.js'],
			migrations: ['build/migrations/**/*.js'],
			subscribers: ['build/subscribers/**/*.js'],
			cli: {
				entitiesDir: 'src/entities',
				migrationsDir: 'src/migrations',
				subscribersDir: 'src/subscribers'
			},
			extra: {
				ssl: {
					rejectUnauthorized: false
				}
			}
		})

		// const pool = connection.driver as PostgresDriver
		if (connection.driver instanceof PostgresDriver) {
			const pool = connection.driver.master

			pool.on('error', () => {
				setTimeout(async () => {
					// Wait 5 seconds then reconnect
					console.log('Reconnecting to database')
					await connection.close()
					await connection.connect()
					console.log('Reconnected to database')
				}, 5000)
			})
		}

		const app = express()
		const corsCheck = function (req: express.Request, callback: (error: Error | null, corsOptions?: cors.CorsOptions) => void) {
			if (req.header('Origin') === process.env.ORIGIN_URL) {
				return callback(null, {
					origin: true,
					optionsSuccessStatus: 200,
					credentials: true
				})
			}

			return callback(new Error('CORS error'))
		}

		app.set('trust proxy', 1)
		app.use(express.json())
		app.use(cookieParser())

		app.get('/', (req, res) => {
			res.send('Hello World')
		})

		app.use('/auth', cors(corsCheck), auth)
		app.use('/current-user', cors(corsCheck), authJWT, currentUser)
		app.use('/users', cors(corsCheck), authJWT, users)
		app.use('/users/:userId/stocks', cors(corsCheck), authJWT, checkUserAccess, userStocks)
		app.use('/users/:userId/market-buys', cors(corsCheck), authJWT, checkUserAccess, userMarketBuys)
		app.use('/users/:userId/market-sells', cors(corsCheck), authJWT, checkUserAccess, userMarketSells)
		app.use('/users/:userId/limit-buys', cors(corsCheck), authJWT, checkUserAccess, userLimitBuys)
		app.use('/users/:userId/limit-sells', cors(corsCheck), authJWT, checkUserAccess, userLimitSells)
		app.use('/users/:userId/notifications', cors(corsCheck), authJWT, checkUserAccess, userNotifications)
		app.use('/users/:userId/watch-list-stocks', cors(corsCheck), authJWT, checkUserAccess, userWatchListStocks)
		app.use('/sse-notifications', cors(corsCheck), authJWT, sseNotifications)
		app.use('/stocks', cors(corsCheck), authJWT, stocks)

		app.listen(process.env.PORT || 5000, () => {
			console.log('Server running on PORT 5000')
		})

		// schedule jobs
		const endOfTradingDayRule = new schedule.RecurrenceRule()

		endOfTradingDayRule.tz = 'America/New_York'
		endOfTradingDayRule.dayOfWeek = new schedule.Range(1, 5)
		endOfTradingDayRule.hour = 16
		endOfTradingDayRule.minute = 0
		schedule.scheduleJob(endOfTradingDayRule, recordPortfolioCloseValues)

		const beginningOfTradingDayRule = new schedule.RecurrenceRule()

		beginningOfTradingDayRule.tz = 'America/New_York'
		beginningOfTradingDayRule.dayOfWeek = new schedule.Range(1, 5)
		beginningOfTradingDayRule.hour = 9
		beginningOfTradingDayRule.minute = 30
		schedule.scheduleJob(beginningOfTradingDayRule, () => {
			executePendingMarketBuys()
			executePendingMarketSells()
		})

		const limitOrderFirstHourRule = new schedule.RecurrenceRule()

		limitOrderFirstHourRule.tz = 'America/New_York'
		limitOrderFirstHourRule.dayOfWeek = new schedule.Range(1, 5)
		limitOrderFirstHourRule.hour = 9
		limitOrderFirstHourRule.minute = new schedule.Range(30, 59)
		schedule.scheduleJob(limitOrderFirstHourRule, executePendingLimitOrders)

		const limitOrderRule = new schedule.RecurrenceRule()

		limitOrderRule.tz = 'America/New_York'
		limitOrderRule.dayOfWeek = new schedule.Range(1, 5)
		limitOrderRule.hour = new schedule.Range(10, 15)
		limitOrderRule.minute = new schedule.Range(0, 59)
		schedule.scheduleJob(limitOrderRule, executePendingLimitOrders)

		const limitOrderCancelRule = new schedule.RecurrenceRule()

		limitOrderCancelRule.tz = 'America/New_York'
		limitOrderCancelRule.dayOfWeek = new schedule.Range(1, 5)
		limitOrderCancelRule.hour = 16
		limitOrderCancelRule.minute = 0
		schedule.scheduleJob(limitOrderCancelRule, cancelPendingLimitOrders)
	} catch (error) {
		console.error(`Error while starting server: ${error.message}`)
	}
}

startServer()
