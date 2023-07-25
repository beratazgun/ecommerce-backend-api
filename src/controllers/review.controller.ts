import Review from '../models/review.model'
import Product from '../models/product.model'
import createHttpError from 'http-errors'
import { Request, Response, NextFunction } from 'express'
import AsyncCatchError from '../utils/AsyncCatchError'
import { pick } from 'lodash'

export default class ReviewController {
	createReview = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id } = req.session.user

			const productId = await Product.findOne({
				productSlug: req.params.productSlug,
			})

			if (!productId) {
				return next(new createHttpError.NotFound('Product not found.'))
			}

			await Review.create({
				...req.body,
				customerId: _id,
				productId: productId._id,
			})

			res.status(201).json({
				status: 'success',
				isSuccess: true,
				message: 'Review created successfully.',
			})
		}
	)

	getReviews = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { productSlug } = req.params

			const product = await Product.findOne({ productSlug })

			if (!product) {
				return next(new createHttpError.NotFound('Product not found.'))
			}

			const reviews = await Review.find({
				productId: product._id,
			})
				.populate('customerId', 'firstName lastName')
				.populate('productId', 'productName productSlug')

			if (!reviews) {
				return next(new createHttpError.NotFound('Reviews not found.'))
			}

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				reviewsLength: reviews.length,
				result: reviews,
			})
		}
	)

	deleteReview = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id } = req.session.user

			const review = await Review.findById(req.params.id)

			if (!review) {
				return next(new createHttpError.NotFound('Review not found.'))
			}

			if (review.customerId.toString() !== _id) {
				return next(
					new createHttpError.Unauthorized(
						'You are not authorized to perform this action.'
					)
				)
			}

			await Review.findByIdAndDelete(req.params.id)

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message: 'Review deleted successfully.',
			})
		}
	)

	updateReview = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { id } = req.params

			const allowedFields = pick(req.body, Object.keys(Review.schema.obj))

			const review = await Review.findById(id)

			if (!review) {
				return next(new createHttpError.NotFound('Review not found.'))
			}

			await Review.findByIdAndUpdate(id, allowedFields)

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message: 'Review updated successfully.',
			})
		}
	)
}
