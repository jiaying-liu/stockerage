import redis = require('redis')

export let redisConnected = false
const redisClient = redis.createClient({
	host: process.env.REDIS_HOST,
	port: Number(process.env.REDIS_PORT),
	password: process.env.REDIS_PASSWORD
})

redisClient.on('connect', () => {
	console.log('Successfully connected to Redis Instance')
	redisConnected = true
})

redisClient.on('error', error => {
	console.error(`Error on Redis Client: ${error.message}`)
})

export default redisClient
