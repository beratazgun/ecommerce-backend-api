import { Request, Response, NextFunction } from 'express'
import Order from '../models/order.model'
import AsyncCatchError from '../utils/AsyncCatchError'
import { nanoIdGenerator } from '../utils/generator'

export default class OrderController {
	createOrder = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id } = req.session.user

			const order = await Order.create({
				customerId: _id,
				orderId: nanoIdGenerator('1234567890', 18),
				...req.body,
			})

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message: 'Order created successfully.',
			})
		}
	)

	cancelOrder = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { id } = req.params

			await Order.findByIdAndUpdate(id, {
				isCanceled: true,
			})

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message: 'Order canceled successfully.',
			})
		}
	)

	getMyOrders = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id } = req.session.user

			const orders = await Order.find({ customerId: _id, isCanceled: false })

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				result: orders,
			})
		}
	)
}
