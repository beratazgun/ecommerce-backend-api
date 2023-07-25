import { Request, Response, NextFunction } from 'express'
import AsyncCatchError from '../utils/AsyncCatchError'
import createHttpError from 'http-errors'
import ProductModel from '../models/productModel.model'
import Brand from '../models/brand.model'
import Category from '../models/category.model'

export default class ProductModelController {
	createProductModel = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const checkBrand = await Brand.findOne({
				$or: [
					{
						brandSlug: req.body.brandSlug,
					},
					{
						brand: req.body.brand,
					},
				],
			})

			const checkCategory = await Category.findOne({
				$or: [
					{
						categorySlug: req.body.categorySlug,
					},
					{
						categoryName: req.body.categoryName,
					},
				],
			})

			if (!checkBrand) {
				return next(createHttpError.BadRequest('This brand does not exist.'))
			}

			if (!checkCategory) {
				return next(createHttpError.BadRequest('This category does not exist.'))
			}

			const productModel = await ProductModel.create({
				model: req.body.model,
				brandId: checkBrand?._id,
				categoryId: checkCategory?._id,
			})

			res.status(201).json({
				status: 'success',
				result: {
					productModel,
				},
			})
		}
	)

	getAllProductModel = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const productModel = await ProductModel.find()

			res.status(200).json({
				status: 200,
				isSuccess: true,
				result: productModel,
			})
		}
	)

	getAllProductModelForCategory = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { category } = req.params

			const categoryId = await Category.find({ categorySlug: category })

			const productModel = await ProductModel.find({ categoryId }).select(
				'model modelSlug -_id'
			)

			res.status(200).json({
				status: 200,
				isSuccess: true,
				result: productModel,
			})
		}
	)
}
