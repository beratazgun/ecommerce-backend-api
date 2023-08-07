import Redis from 'ioredis'

class RedisConnection {
	private static instance: Redis

	private constructor() {}

	public static connect(): Redis {
		if (!RedisConnection.instance) {
			RedisConnection.instance = new Redis({
				port: Number(process.env.REDIS_PORT),
				host: process.env.REDIS_HOST as string,
				password: process.env.REDIS_PW,
			})
		}

		return RedisConnection.instance
	}
}

const redisConnection = RedisConnection.connect()

export { redisConnection }
