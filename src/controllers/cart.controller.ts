import { client } from '../services/redis/client'
import AsyncCatchError from '../utils/AsyncCatchError'
import { Request, Response, NextFunction } from 'express'
import { cart } from '../services/redis/keys'
import Product from '../models/product.model'
import { nanoIdGenerator } from '../utils/generator'
import { values } from 'lodash'

interface CartItem {
	id: string
	quantity: number
	color: string
	storage: string
	name: string
	brand: string
	productSlug: string
	categoryName: string
	images: string[]
	freeCargo: boolean
	deliveryTime: number
	storeName: string
	cargoPrice: number
	price: {
		sellingPrice: number
		totalPrice: number
		currency: string
	}
	createAt: Date
}

class CartController {
	addToCart = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			let updatedQuantity: number = 0
			let updateTotalPrice: number = 0
			const { _id } = req.session.user || ' '
			const {
				id,
				color,
				storage,
				price,
				categoryName,
				name,
				quantity,
				images,
				brand,
				productSlug,
				cargoPrice,
				storeName,
				freeCargo,
				deliveryTime,
			}: CartItem = req.body

			if (!_id) {
				return next(new Error('Please login to add to cart'))
			}

			const product = await Product.findById(id)

			if (!product) {
				return next(new Error('Product not found'))
			}

			const data = await client.hgetall(cart(_id))

			const isExist = Object.keys(data).find((key) => {
				return (
					JSON.parse(data[key]).color === color &&
					JSON.parse(data[key]).id === id
				)
			})

			values(data).forEach((element) => {
				const item = JSON.parse(element)
			})

			if (isExist) {
				const existingItem = (await client.hget(cart(_id), isExist)) as string
				const existingQuantity = JSON.parse(existingItem).quantity

				updatedQuantity = existingQuantity + (quantity as number)
				updateTotalPrice = updatedQuantity * price.sellingPrice + cargoPrice
			}

			const cartId = nanoIdGenerator('1234567890', 16)

			await client.hset(
				cart(_id),
				isExist || cartId,
				JSON.stringify({
					id,
					cartId: isExist || cartId,
					quantity: updatedQuantity || quantity,
					color,
					storage,
					name,
					categoryName,
					brand,
					productSlug,
					deliveryTime,
					images,
					storeName,
					cargoPrice,
					price: {
						sellingPrice: price.sellingPrice,
						totalPrice:
							updateTotalPrice ||
							price.sellingPrice * quantity + (freeCargo ? 0 : cargoPrice),
						currency: price.currency,
					},
					createAt: new Date(Date.now()),
				})
			)

			res.status(200).json({
				message: 'successfully added to cart',
				isSuccess: true,
				status: 200,
			})
		}
	)

	getCart = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id } = req.session.user || ' '

			if (!_id) {
				return next(new Error('Please login to add to cart'))
			}

			const cartItems = await client.hgetall(cart(_id))

			res.status(200).json({
				message: 'success',
				isSuccess: true,
				status: 200,
				result: {
					itemsCount: Object.values(cartItems).reduce(
						(acc, item) => acc + JSON.parse(item).quantity,
						0
					),
					items: Object.keys(cartItems).map((key) =>
						JSON.parse(cartItems[key])
					),
					summary: {
						totalPrice: Object.keys(cartItems).reduce(
							(acc, key) => acc + JSON.parse(cartItems[key]).price.totalPrice,
							0
						),
						totalCargoPrice: Object.keys(cartItems).reduce(
							(acc, key) => acc + JSON.parse(cartItems[key]).cargoPrice,
							0
						),
						total: Object.keys(cartItems).reduce(
							(acc, key) =>
								acc +
								JSON.parse(cartItems[key]).price.totalPrice +
								JSON.parse(cartItems[key]).price.cargoPrice,
							0
						),
					},
				},
			})
		}
	)

	deleteFromCart = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id } = req.session.user || ' '
			const { id } = req.body

			if (!_id) {
				return next(new Error('Please login to add to cart'))
			}

			const isExist = await client.hexists(cart(_id), id)

			if (!isExist) {
				return next(new Error('Product not found'))
			}

			await client.hdel(cart(_id), id)

			res.status(200).json({ message: 'success', isSuccess: true, status: 200 })
		}
	)

	getItemCounts = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id } = req.session.user || ' '

			if (!_id) {
				return next(new Error('Please login to add to cart'))
			}

			const cartItems = await client.hgetall(cart(_id))

			const itemsCount = Object.values(cartItems).reduce(
				(acc, item) => acc + JSON.parse(item).quantity,
				0
			)

			res.status(200).json({
				message: 'success',
				isSuccess: true,
				status: 200,
				result: itemsCount,
			})
		}
	)
}

export default CartController
