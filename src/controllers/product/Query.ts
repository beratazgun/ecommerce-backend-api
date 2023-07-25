// I know the code is not clean but I will fix it later

import Category from '../../models/category.model'
import Product from '../../models/product.model'
import { Document } from 'mongoose'
import Features, { FeaturesSchemaFields } from '../../models/features.model'
import Brand from '../../models/brand.model'
import ProductModel from '../../models/productModel.model'
import { isArray, uniq } from 'lodash'
import {
	inOperatorList,
	booleanOperatorList,
	topAndBottomLimits,
	paginateKeys,
} from './queryList'
import { ProductSchemFields } from '../../models/product.model'
import { CategorySchemaFields } from '../../models/category.model'

interface ProductDocument
	extends Document<
		ProductSchemFields,
		CategorySchemaFields,
		FeaturesSchemaFields
	> {
	[key: string]: any
}

interface paginateObj {
	limit: number
	skip: number
	page: number
	nextPage: number | null
	prevPage: number
	length: number
	totalLength: number
	totalPages: number
	currentPage: number
	hasNextPage: boolean
	hasPrevPage: boolean
}

interface queryBody {
	[key: string]: any
}

export default class Query {
	queryObj: { [key: string]: unknown } = {}
	sortObj: Record<string, 1 | -1> = {}
	paginateObj: paginateObj = {
		limit: 0,
		skip: 0,
		page: 0,
		nextPage: 0,
		prevPage: 0,
		hasNextPage: false,
		hasPrevPage: false,
		currentPage: 0,
		length: 0,
		totalLength: 0,
		totalPages: 0,
	}

	constructor(public query: queryBody) {
		this.editQuery()
		this.filter()
		this.sort()
	}

	setTopAndBottom(str: string) {
		const data = str.split('-').sort((a, b) => {
			return parseFloat(a) - parseFloat(b)
		})

		if (data[1] === '') {
			return {
				bottom: parseFloat(data[0]),
				top: parseFloat(data[0]),
			}
		}

		return {
			bottom: parseFloat(data[0]),
			top: parseFloat(data[1]),
		}
	}

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

	editQuery() {
		Object.keys(this.query).forEach((key: string) => {
			if (
				this.query[key].includes('|') &&
				this.query[key]?.split('|').length > 1
			) {
				this.query[key] = this.query[key].split('|').map((el: string) => {
					if (el.includes('-')) {
						return el.replace(/-/g, ' ')
					} else {
						return !isNaN(parseFloat(el)) ? parseInt(el) : el
					}
				})
			} else if (
				typeof this.query[key] === 'string' &&
				this.query[key].includes('-') &&
				isNaN(parseFloat(this.query[key]))
			) {
				this.query[key] = this.query[key].split('|')[0].replace(/-/g, ' ')
			} else if (booleanOperatorList.includes(key)) {
				this.query[key] = this.query[key] === 'true'
			} else if (
				!isNaN(parseFloat(this.query[key])) &&
				!isArray(this.query[key]) &&
				!this.query[key].includes('-')
			) {
				this.query[key] = parseInt(this.query[key])
			}
		})

		return this
	}

	filter() {
		const keys = this.createKeyMap()

		Object.keys(this.query).forEach((key) => {
			if (topAndBottomLimits.includes(key)) {
				let { bottom, top } = this.setTopAndBottom(this.query[key])

				this.queryObj[keys[key === 'price' ? 'sellingPrice' : key]] = {
					$gte: bottom,
					$lte: top,
				}
			} else if (inOperatorList.includes(key)) {
				if (isArray(this.query[key])) {
					this.queryObj[keys[key]] = {
						$in: [...this.query[key]],
					}
				} else {
					this.queryObj[keys[key]] = this.query[key]
				}
			} else if (paginateKeys.includes(key) || key === 'sort') {
				return
			} else {
				this.queryObj[keys[key]] = this.query[key]
			}
		})

		return this
	}

	sort() {
		const fields: {
			[key: string]: { [key: string]: 1 | -1 }
		} = {
			PRICE_BY_ASC: { price: 1 },
			PRICE_BY_DESC: { price: -1 },
			MOST_RECENT: { createdAt: -1 },
			MOST_POPULER: { numberOfRatings: -1 },
			MOST_RATED: { averageRating: -1 },
			MOST_COMMENTED: { numberOfComments: -1 },
			MOST_VIEWED: { viewCount: -1 },
		}

		this.sortObj = fields[this.query.sort]

		return this
	}

	async paginate(res: ProductDocument[]) {
		const page = this.query.page * 1 || 1
		const limit = this.query.limit * 1 || 100
		const skip = (page - 1) * limit

		this.paginateObj.limit = limit
		this.paginateObj.skip = skip
		this.paginateObj.page = page
		this.paginateObj.currentPage = page

		this.paginateObj.hasPrevPage = page > 1
		this.paginateObj.length = res.length
		this.paginateObj.totalLength = await Product.where().countDocuments()

		this.paginateObj.totalPages = Math.ceil(
			this.paginateObj.length / this.paginateObj.limit
		)
		this.paginateObj.hasNextPage =
			this.paginateObj.totalPages > this.paginateObj.page
		this.paginateObj.nextPage =
			page && this.paginateObj.totalPages > this.paginateObj.currentPage
				? page + 1
				: null
		this.paginateObj.prevPage = page === 1 ? 1 : page - 1

		return this.paginateObj
	}

	async result() {
		const response = await Product.aggregate<ProductDocument>([
			// {
			// 	$lookup: {
			// 		from: 'stores',
			// 		localField: 'storeId',
			// 		foreignField: '_id',
			// 		as: 'store',
			// 	},
			// },
			// {
			// 	$unwind: '$store',
			// },
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
				$match: { ...this.queryObj },
			},
			{
				$project: {
					_id: 1,
					name: 1,
					brand: '$brand.brand',
					price: '$price.sellingPrice',
					cargoPrice: '$cargoPrice',
					category: '$category.category',
					model: '$model.model',
					productSlug: '$productSlug',
					storage: '$features.basicHardware.internalStorage',
					images: '$images',
					ram: '$features.basicHardware.ram',
					color: '$features.design.color',
					storeName: '$store.storeName',
					createdAt: 1,
					numberOfRating: 1,
					freeCargo: 1,
					numberOfComments: 1,
					url: {
						$concat: ['/product/', '$brand.brand', '/', '$productSlug'],
					},
				},
			},
			{
				$sort: {
					...(this.sortObj ?? { createdAt: -1 }),
				},
			},
		])

		const paginate = await this.paginate(response)

		const skip = this.paginateObj.skip
		const limit = this.paginateObj.limit

		return {
			result: {
				docs: response.slice(skip, skip + limit),
				...paginate,
			},
		}
	}
}
