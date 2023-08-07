import { Request, Response, NextFunction } from 'express'
import AsyncCatchError from '../utils/AsyncCatchError'
import Address from '../models/address.model'
import mongoose, { Schema } from 'mongoose'
import createHttpError from 'http-errors'
import { pick, map } from 'lodash'
import { redisConnection } from '../services/redis/redisConnection'

export default class AddressController {
	createAddress = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id, role } = req.session.user
			const userRole = role === 'seller' ? 'sellerId' : 'customerId'
			const modelName = role === 'seller' ? 'Seller' : 'Customer'

			const address = await Address.create({ ...req.body, [userRole]: _id })
			await redisConnection
				.hset(`address#${_id}`, address._id.toString(), JSON.stringify(address))
				.then(() => {
					return redisConnection.expire(`address#${_id}`, 60 * 60 * 24 * 10)
				})

			await mongoose.model(modelName).findByIdAndUpdate(
				_id,
				{
					$push: {
						address: address._id,
					},
				},
				{ new: true }
			)

			res.status(201).json({
				status: 'success',
				isSuccess: true,
				message: 'Address created successfully.',
				result: address,
			})
		}
	)

	deleteAddress = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { addressId } = req.body
			const { _id, role } = req.session.user
			const modelName = role === 'seller' ? 'Seller' : 'Customer'

			const user = await mongoose.model(modelName).findById(_id)
			await redisConnection.hdel(`address#${_id}`, addressId)

			if (!user.address.includes(addressId)) {
				return next(
					createHttpError.BadRequest('This address does not belong to you.')
				)
			}

			await Address.findByIdAndDelete(addressId)

			await mongoose.model(modelName).findByIdAndUpdate(
				_id,
				{
					$pull: {
						address: addressId,
					},
				},
				{ new: true }
			)

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message: 'Address deleted successfully.',
			})
		}
	)

	getAllAddress = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id, role } = req.session.user
			const modelName = role === 'seller' ? 'Seller' : 'Customer'
			let result: any = {}
			let numberOfAddress: any = {}

			const checkRedis = await redisConnection.hgetall(`address#${_id}`)

			if (checkRedis && Object.keys(checkRedis).length > 0) {
				const addresses = Object.values(checkRedis).map((el) => JSON.parse(el))

				result = addresses
				numberOfAddress = addresses.length
			} else {
				const myAddresses = await mongoose
					.model(modelName)
					.findById(_id)
					.populate({
						path: 'address',
						select: '-__v',
					})

				if (!myAddresses) {
					return next(createHttpError.NotFound('No address found.'))
				}

				if (myAddresses.address.length !== 0) {
					myAddresses?.address
						?.forEach((el: any) => {
							redisConnection.hset(
								`address#${_id}`,
								el._id.toString(),
								JSON.stringify(el)
							)
						})
						.then(() => {
							return redisConnection.expire(`address#${_id}`, 60 * 60 * 24 * 10)
						})
				}

				result = myAddresses.address
				numberOfAddress = myAddresses.address.length
			}

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				numberOfAddress,
				result,
			})
		}
	)

	updateAddress = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { addressId } = req.body
			const { _id, role } = req.session.user
			const modelName = role === 'seller' ? 'Seller' : 'Customer'

			const allowedFields = pick(req.body, Object.keys(Address.schema.obj))

			const model = await mongoose.model(modelName).findById(_id)
			await redisConnection.hset(
				`address#${_id}`,
				addressId,
				JSON.stringify({
					...allowedFields,
					_id: addressId,
					customerId: _id,
				})
			)

			const addressIds = map(model.address, (el: Schema.Types.ObjectId) =>
				el.toString()
			)

			if (!addressIds.includes(addressId)) {
				return next(
					createHttpError.BadRequest('This address does not belong to you.')
				)
			}

			const address = await Address.findByIdAndUpdate(addressId, allowedFields)

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message: 'Address updated successfully.',
				result: address,
			})
		}
	)
}
