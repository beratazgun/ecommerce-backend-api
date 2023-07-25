import { Request, Response, NextFunction } from 'express'
import AsyncCatchError from '../utils/AsyncCatchError'
import Category from '../models/category.model'
import slugify from 'slugify'
import createHttpError from 'http-errors'

export default class CategoryController {
	createCategory = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { category }: { category: string } = req.body
			const categorySlug = slugify(category, {
				lower: true,
				replacement: '-',
				trim: true,
			})

			await Category.create({
				category,
				categorySlug,
			})

			res.status(201).json({
				status: 'success',
			})
		}
	)

	getAllCategories = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const categories = await Category.find()

			res.status(200).json({
				status: 'success',
				numberOfCategories: categories.length,
				result: categories,
			})
		}
	)

	deleteCategory = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const category = await Category.findOneAndDelete({
				categorySlug: req.params.categorySlug,
			})

			if (!category) {
				return next(createHttpError.BadRequest('This category does not exist.'))
			}

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message: 'Category deleted successfully.',
			})
		}
	)
}
