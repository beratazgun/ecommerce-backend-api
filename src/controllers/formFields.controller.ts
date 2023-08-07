import { Request, Response, NextFunction } from 'express'
import AsyncCatchError from '../utils/AsyncCatchError'
import FormFields from '../models/formFields.model'
import createHttpError from 'http-errors'
import { redisConnection } from '../services/redis/redisConnection'
import Category from '../models/category.model'
import { formField } from '../services/redis/keys'
import { unset } from 'lodash'

export default class FormFieldsController {
	createFormFields = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const categoryId = await Category.find({ category: req.body.category })

			const formFields = await FormFields.create({
				categoryId: categoryId[0]._id,
				category: req.body.category,
				fields: req.body.fields,
			})

			if (!formFields) {
				return next(createHttpError(400, 'Form fields not created.'))
			}

			let fields = formFields.toObject().fields
			for (const el of fields) {
				unset(el, '_id')
			}

			redisConnection.set(
				formField(req.body.category),
				JSON.stringify({
					category: formFields.toObject().category,
					fields: fields,
				})
			)

			res.status(201).json({
				success: true,
				message: 'Form fields created.',
			})
		}
	)

	getFormFields = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const checkRedis = await redisConnection.get(
				formField(req.params.category)
			)

			if (checkRedis) {
				return res.status(200).json({
					success: true,
					message: 'Form fields found.',
					result: JSON.parse(checkRedis),
				})
			} else {
				const formFields = await FormFields.aggregate([
					{
						$match: {
							category: req.params.category,
						},
					},
					{
						$unwind: '$fields',
					},
					{
						$project: {
							_id: 0,
							category: 1,
							fields: {
								type: '$fields.type',
								id: '$fields.id',
								label: '$fields.label',
							},
						},
					},
				])

				if (!formFields) {
					return next(createHttpError(404, 'Form fields not found.'))
				}

				redisConnection.set(
					formField(req.params.category),
					JSON.stringify(formFields)
				)

				res.status(200).json({
					success: true,
					message: 'Form fields found.',
					result: formFields,
				})
			}
		}
	)
}
