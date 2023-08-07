import Filter from '../models/filter.model'
import AsyncCatchError from '../utils/AsyncCatchError'
import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import Product from '../models/product.model'
import Category from '../models/category.model'
import Features from '../models/features.model'
import Brand from '../models/brand.model'
import ProductModel from '../models/productModel.model'
import { map, uniq } from 'lodash'
import { redisConnection } from '../services/redis/redisConnection'
import { filter } from '../services/redis/keys'
import { booleanOperatorList } from './product/queryList'

export interface filterListInterface {
	filterName: string
	beautifulFilterName: string
	filterValues: any[]
	beautifulFilterValues: any[]
}

export default class FilterController {
	createKeyMap() {
		const featuresKeyList = [
			'design',
			'screen',
			'basicHardware',
			'camera',
			'battery',
		]
		const categoryKeyList = ['category', 'categorySlug']
		const keyList = uniq([
			...Object.keys(Product.schema.paths),
			...Object.keys(Category.schema.paths),
			...Object.keys(Features.schema.paths),
			...Object.keys(Brand.schema.paths),
			...Object.keys(ProductModel.schema.paths),
		])

		let keyMap: { [key: string]: string } = {}
		keyList.forEach((key) => {
			if (featuresKeyList.includes(key.split('.')[0])) {
				keyMap[key.split('.')[key.split('.').length - 1]] = `features.${key}`
			} else if (categoryKeyList.includes(key.split('.')[0])) {
				keyMap[key.split('.')[key.split('.').length - 1]] = `category.${key}`
			} else if (['model', 'brand'].includes(key)) {
				keyMap[key.split('.')[key.split('.').length - 1]] = `${key}.${key}`
			} else if (['_id', '__v'].includes(key)) {
				delete keyMap[key]
			} else {
				keyMap[key.split('.')[key.split('.').length - 1]] = `${key}`
			}
		})

		return keyMap
	}

	createFilter = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const keyMap = this.createKeyMap()
			let filterList: filterListInterface[] = []

			const checkCategory = await Category.find({ category: req.body.category })

			for (const filter of req.body.filters) {
				if (keyMap[filter.filterName]) {
					const product = await Product.aggregate([
						{
							$lookup: {
								from: 'stores',
								localField: 'storeId',
								foreignField: '_id',
								as: 'store',
							},
						},
						{
							$unwind: '$store',
						},
						{
							$lookup: {
								from: 'features',
								localField: 'featuresId',
								foreignField: '_id',
								as: 'features',
							},
						},
						{
							$unwind: '$features',
						},
						{
							$lookup: {
								from: 'productmodels',
								localField: 'modelId',
								foreignField: '_id',
								as: 'model',
							},
						},
						{
							$unwind: '$model',
						},
						{
							$lookup: {
								from: 'brands',
								localField: 'brandId',
								foreignField: '_id',
								as: 'brand',
							},
						},
						{
							$unwind: '$brand',
						},
						{
							$lookup: {
								from: 'categories',
								localField: 'categoryId',
								foreignField: '_id',
								as: 'category',
							},
						},
						{
							$unwind: '$category',
						},
						{
							$match: {
								categoryId: checkCategory[0]._id,
							},
						},
						{
							$group: {
								_id: `$${keyMap[filter.filterName]}`,
							},
						},
					])

					if (booleanOperatorList.includes(filter.filterName)) {
						filterList.push({
							filterName: filter.filterName,
							beautifulFilterName: filter.beautifulFilterName,
							filterValues: [true, false],
							beautifulFilterValues: ['There are', 'there aren’t'],
						})
					} else {
						filterList.push({
							filterName: filter.filterName,
							beautifulFilterName: filter.beautifulFilterName,
							beautifulFilterValues: [
								...map(map(product, '_id'), (el) => {
									if (filter.filterName === 'internalStorage') {
										return el > 1000
											? `${Math.floor(el / 1000)} ${filter.appendixName[1]}`
											: `${el} ${filter.appendixName[0]}`
									} else if (filter.appendixName[0] === ' ') {
										return el
									} else {
										return `${el} ${filter.appendixName[0]}`
									}
								}),
							],
							filterValues: [...map(product, '_id').sort((a, b) => a - b)],
						})
					}
				}
			}

			await Filter.create({
				categoryId: checkCategory[0]._id,
				filters: filterList,
				category: checkCategory[0].categorySlug,
			})

			await redisConnection.set(
				filter(checkCategory[0].category),
				JSON.stringify({
					filters: filterList,
					category: checkCategory[0].categorySlug,
				})
			)

			res.status(200).json({
				isSuccess: true,
				message: 'Create filter successfully',
				result: {
					categoryId: checkCategory[0]._id,
					filters: filterList,
					category: checkCategory[0].categorySlug,
				},
			})
		}
	)

	getFilter = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { category } = req.params

			const checkRedis = await redisConnection.get(filter(category))

			if (checkRedis === null) {
				const fetchFilter = await Filter.aggregate([
					{
						$match: {
							category: category,
						},
					},
					{
						$unwind: '$filters',
					},
					{
						$group: {
							_id: '$filters.filterName',
							category: {
								$first: '$category',
							},
							values: {
								$addToSet: '$filters.values',
							},
							beautifulName: {
								$first: '$filters.beautifulName',
							},
						},
					},
					{
						$project: {
							_id: 0,
							filterName: '$_id',
							values: {
								$reduce: {
									input: '$values',
									initialValue: [],
									in: { $concatArrays: ['$$values', '$$this'] },
								},
							},
							beautifulName: 1,
						},
					},
				])

				if (['cargoFree', 'externalStorage']) {
				}

				await redisConnection.set(
					filter(category),
					JSON.stringify({
						category: category,
						filters: fetchFilter,
					})
				)
			}

			const result = await redisConnection.get(filter(category))

			if (result === null) {
				return next(new createHttpError.NotFound('Category not found'))
			}

			res.status(200).json({
				isSuccess: true,
				message: 'Get filter successfully',
				result: JSON.parse(result),
			})
		}
	)
}
