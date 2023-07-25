import Redis from 'ioredis'

const client = new Redis({
	port: Number(process.env.REDIS_PORT),
	host: process.env.REDIS_HOST as string,
	password: process.env.REDIS_PW,
})

client.on('connect', () => console.log('Redis client connected 🔴🔴🔴'))

export { client }
