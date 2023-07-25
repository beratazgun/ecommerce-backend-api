import Brand from '../models/brand.model'
import { Request, Response, NextFunction } from 'express'
import AsyncCatchError from '../utils/AsyncCatchError'
import createHttpError from 'http-errors'

export default class BrandController {
	createBrand = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			await Brand.create(req.body)

			res.status(201).json({
				status: 'success',
				isSuccess: true,
				message: 'Brand created successfully.',
			})
		}
	)

	getAllBrands = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const brands = await Brand.aggregate([
				{
					$project: {
						_id: 0,
						brand: 1,
						brandSlug: 1,
						brandId: 1,
						logoİmage: 1,
					},
				},
			])

			if (!brands) {
				return next(createHttpError.NotFound('No brands found.'))
			}

			res.status(200).json({
				status: 'success',
				result: brands,
			})
		}
	)
}
