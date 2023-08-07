import AsyncCatchError from '../utils/AsyncCatchError'
import { Request, Response, NextFunction } from 'express'
import { redisConnection } from '../services/redis/redisConnection'
import { favorite } from '../services/redis/keys'
import createHttpError from 'http-errors'

export default class FavoriteController {
	AddFavorite = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { productId } = req.body
			const { _id } = req.session.user

			const isExist = await redisConnection.sismember(
				favorite(_id as string),
				productId
			)

			if (isExist) {
				return next(new createHttpError.BadRequest('Already Added'))
			}

			await redisConnection.sadd(favorite(_id as string), productId)

			res.status(200).json({
				status: 'success',
				message: 'Add Favorite',
			})
		}
	)

	IsFavorite = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { productId } = req.body
			const { _id } = req.session.user
			const isExist = await redisConnection.sismember(
				favorite(_id as string),
				productId as string
			)

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message: 'In the Favori list.',
				result: isExist === 1 ? true : false,
			})
		}
	)

	GetFavorite = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id } = req.session.user

			const data = await redisConnection.smembers(favorite(_id as string))

			res.status(200).json({
				status: 'success',
				data,
			})
		}
	)

	RemoveFavorite = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { productId } = req.body
			const { _id } = req.session.user

			const isExist = await redisConnection.srem(
				favorite(_id as string),
				productId
			)

			if (isExist === 0) {
				return next(new createHttpError.BadRequest('Not Found'))
			}

			res.status(200).json({
				status: 'success',
				message: 'Remove Favorite',
			})
		}
	)
}
