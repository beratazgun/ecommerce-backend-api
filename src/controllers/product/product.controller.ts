import { Request, Response, NextFunction } from 'express'
import AsyncCatchError from '../../utils/AsyncCatchError'
import Product from '../../models/product.model'
import Store from '../../models/store.model'
import Brand from '../../models/brand.model'
import Category from '../../models/category.model'
import createHttpError from 'http-errors'
import { toString, pick, omit } from 'lodash'
import Query from './Query'
import { nanoIdGenerator, generateSlug } from '../../utils/generator'
import Features from '../../models/features.model'
import ProductModel from '../../models/productModel.model'
import { Types } from 'mongoose'

export default class ProductController {
	createProduct = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			let keysValues: any[] = []
			const { _id } = req.session.user
			const noticeID = nanoIdGenerator('1234567890', 10)

			const checkCategory = await Category.findOne({
				categorySlug: generateSlug(req.body.category),
			})

			const checkBrand = await Brand.findOne({
				brandSlug: req.body.brand,
			})

			const checkModel = await ProductModel.findOne({
				model: req.body.model,
			})

			if (!checkCategory) {
				return next(createHttpError.BadRequest('This category does not exist.'))
			}

			if (!checkBrand) {
				return next(createHttpError.BadRequest('This brand does not exist.'))
			}

			Object.keys(req.body.features).forEach((key) => {
				let insideKeysValues: any[] = []

				Object.keys(req.body.features[key]).forEach((insideKey) => {
					insideKeysValues.push({
						key: insideKey,
						value: req.body.features[key][insideKey],
					})
				})

				keysValues.push(...insideKeysValues)
			})

			const product = await Product.create({
				...req.body,
				sellerId: _id,
				categoryId: checkCategory?._id,
				productSlug: generateSlug(
					`${req.body.brand} ${req.body.name}-ni-${noticeID} `
				),
				brandId: checkBrand?._id,
				noticeId: noticeID,
				modelId: checkModel?._id,
			})

			const features = await Features.create({
				...req.body.features,
				modelId: checkModel?._id,
				productId: product._id,
				noticeId: noticeID,
			})

			await product.updateOne({
				$set: {
					featuresId: features._id,
				},
			})

			res.status(201).json({
				status: 'success',
				isSuccess: true,
				message: 'Product created successfully.',
				// result: {
				// 	product,
				// },
			})
		}
	)

	getAllProducts = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const query = new Query(req.query)
			const result = await query.result()

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				...result,
			})
		}
	)

	getProduct = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { slug } = req.params

			const product = await Product.aggregate([
				{
					$match: {
						productSlug: slug,
					},
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
					$project: {
						_id: 0,
						name: 1,
						brand: '$brand.brand',
						model: '$model.model',
						price: 1,
						quantity: 1,
						images: 1,
						productSlug: 1,
						sellerId: 1,
						createdAt: 1,
						averageRating: 1,
						features: {
							screen: 1,
							design: 1,
							camera: 1,
							battery: 1,
							basicHardware: 1,
						},
					},
				},
			])

			const store = await Store.find({ sellerId: product[0]?.sellerId })

			if (!store) {
				return next(createHttpError.NotFound('This store does not exist.'))
			}

			if (!product) {
				return next(createHttpError.NotFound('This product does not exist.'))
			}

			res.status(200).json({
				status: 'success',
				result: {
					...product[0],
					store: {
						storeName: store[0]?.storeName,
						storeLogo: store[0]?.storeLogo,
						sellerRating: store[0]?.storeRating,
					},
				},
			})
		}
	)

	getProductGroup = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { slug } = req.params

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
					$match: {
						productSlug: slug,
					},
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
					$lookup: {
						from: 'productmodels',
						localField: 'modelId',
						foreignField: '_id',
						as: 'model',
					},
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
					$lookup: {
						from: 'categories',
						localField: 'categoryId',
						foreignField: '_id',
						as: 'category',
					},
				},
				{
					$unwind: '$features',
				},
				{
					$unwind: '$model',
				},
				{
					$unwind: '$brand',
				},
				{
					$unwind: '$category',
				},
				{
					$project: {
						_id: 1,
						name: 1,
						brand: '$brand.brand',
						price: '$price',
						cargoPrice: '$cargoPrice',
						category: '$category.category',
						model: '$model.model',
						modelId: '$model._id',
						storeName: '$store.storeName',
						storage: '$features.basicHardware.internalStorage',
						images: '$images',
						ram: '$features.basicHardware.ram',
						color: '$features.design.color',
						productSlug: '$productSlug',
						createdAt: 1,
						numberOfRating: 1,
						freeCargo: 1,
						numberOfComments: 1,
						url: {
							$concat: ['/product/', '$brand.brand', '/', '$productSlug'],
						},
					},
				},
			])

			const products = await Product.aggregate([
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
					$match: {
						modelId: product[0]?.modelId,
					},
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
					$lookup: {
						from: 'productmodels',
						localField: 'modelId',
						foreignField: '_id',
						as: 'model',
					},
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
					$unwind: '$features',
				},
				{
					$unwind: '$model',
				},
				{
					$unwind: '$brand',
				},
				{
					$group: {
						_id: {
							color: '$features.design.color',
							storage: '$features.basicHardware.internalStorage',
						},
						maxNumberOfOrders: { $max: '$numberOfOrders' },
						features: { $first: '$features' },
						name: { $first: '$name' },
						images: { $first: '$images' },
						model: { $first: '$model.model' },
						brand: { $first: '$brand.brand' },
						price: { $first: '$price' },
						productSlug: { $first: '$productSlug' },
						cargoPrice: { $first: '$cargoPrice' },
					},
				},
				{
					$sort: {
						maxNumberOfOrders: -1,
					},
				},
				{
					$project: {
						_id: 0,
						name: 1,
						images: 1,
						model: 1,
						brand: 1,
						price: 1,
						cargoPrice: 1,
						productSlug: 1,
						color: '$_id.color',
						storage: '$_id.storage',
						storeName: '$store.storeName',
						createdAt: 1,
						numberOfRating: 1,
						freeCargo: 1,
						numberOfComments: 1,
						url: {
							$concat: ['/product/', '$brand', '/', '$productSlug'],
						},
					},
				},
			])

			if (!products) {
				return next(createHttpError.NotFound('This product does not exist.'))
			}

			const colorMap = new Map()
			const storageMap = new Map()

			products.forEach((item) => {
				const colorKey = item.color
				const storageKey = item.storage

				if (!colorMap.has(colorKey)) {
					colorMap.set(colorKey, {
						color: colorKey,
						contents: [item],
					})
				} else {
					colorMap.get(colorKey).contents.push(item)
				}

				if (!storageMap.has(storageKey)) {
					storageMap.set(storageKey, {
						storage: storageKey,
						contents: [item],
					})
				} else {
					storageMap.get(storageKey).contents.push(item)
				}
			})

			const color = Array.from(colorMap.values()).sort((a, b) => {
				return a.color.localeCompare(b.color)
			})

			const storage = Array.from(storageMap.values()).sort((a, b) => {
				return a.storage - b.storage
			})

			res.status(200).json({
				status: 'success',
				result: {
					color: {
						attributes: color,
						type: 'color',
					},
					storage: {
						attributes: storage,
						type: 'storage',
					},
					product: {
						...omit(product[0], ['modelId']),
					},
				},
			})
		}
	)

	deleteProduct = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id } = req.session.user
			const { slug } = req.params

			const product = await Product.findOne({ productSlug: slug })

			if (!product) {
				return next(createHttpError.NotFound('This product does not exist.'))
			}

			if (toString(product.sellerId) !== _id) {
				return next(
					createHttpError.Unauthorized(
						'You are not authorized to delete this product.'
					)
				)
			}

			await product.deleteOne({ productSlug: slug })

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message: 'Product deleted successfully.',
			})
		}
	)

	updateProduct = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { slug } = req.params
			const allowedFields = pick(req.body, Object.keys(Product.schema.obj))

			await Product.findOneAndUpdate({ productSlug: slug }, allowedFields, {
				new: true,
			})

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message: 'Product updated successfully.',
			})
		}
	)

	getSellersProducts = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id } = req.session.user
			const ObjectId = Types.ObjectId

			console.log(_id)

			const products = await Product.aggregate([
				{
					$match: {
						sellerId: _id,
					},
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
					$lookup: {
						from: 'models',
						localField: 'modelId',
						foreignField: '_id',
						as: 'model',
					},
				},
				{
					$lookup: {
						from: 'stores',
						localField: 'storeId',
						foreignField: '_id',
						as: 'store',
					},
				},
				{
					$unwind: '$brand',
				},
				{
					$unwind: '$models',
				},
				{
					$unwind: '$stores',
				},
				{
					$project: {
						_id: 0,
						name: 1,
						images: 1,
						model: 1,
						brand: 1,
						price: 1,
						cargoPrice: 1,
						productSlug: 1,
						store: {
							storeName: '$store.storeName',
							storeSlug: '$store.storeSlug',
						},
					},
				},
			])

			res.status(200).json({
				status: 'success',
				result: products,
			})
		}
	)
}
