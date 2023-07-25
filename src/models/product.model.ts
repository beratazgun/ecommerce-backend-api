import mongoose, { Schema, model, Document, Model } from 'mongoose'
import { CategorySchemaFields } from './category.model'
import { FeaturesSchemaFields } from './features.model'

export interface ProductSchemFields extends Document {
	productSlug: string
	name: string
	brandId: Schema.Types.ObjectId
	modelId: Schema.Types.ObjectId
	noticeId: string
	numberOfOrders: number
	price: {
		discountedPrice: number
		originalPrice: number
		sellingPrice: number
	}
	description: string
	quantityOfStock: number
	categoryId: Schema.Types.ObjectId
	sellerId: Schema.Types.ObjectId
	numberOfRating: number
	images: string[]
	weight: string
	dimensions: {
		width: number
		height: number
		depth: number
		summary: string
	}
	guarantyTime: number | null
	guarantyType: string | null
	numberOfComments: number
	ratingsCount: [
		{
			rate: number
			count: number
		}
	]
	averageRating: number
	cargoPrice: number
	freeCargo: boolean
	saleCount: number
	deliveryTime: number
	viewCount: number
	createdAt: Date
	updatedAt: Date
	featuresId: Schema.Types.ObjectId
}

const ProductSchema = new Schema<ProductSchemFields>({
	productSlug: {
		type: String,
		required: true,
		trim: true,
		maxlength: 100,
		unique: true,
		lowercase: true,
	},
	noticeId: {
		type: String,
		required: true,
		trim: true,
		maxlength: 100,
		unique: true,
		lowercase: true,
	},
	name: {
		type: String,
		required: true,
		trim: true,
		maxlength: 100,
	},
	brandId: {
		type: Schema.Types.ObjectId,
		ref: 'Brand',
		required: true,
		lowercase: true,
	},
	modelId: {
		type: Schema.Types.ObjectId,
		ref: 'ProductModel',
		required: true,
		lowercase: true,
	},
	numberOfOrders: {
		type: Number,
		required: true,
		min: 0,
		default: 0,
		lowercase: true,
	},
	price: {
		discountedPrice: {
			type: Number,
			required: true,
			min: 0,
		},
		originalPrice: {
			type: Number,
			required: true,
			min: 0,
		},
		sellingPrice: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	description: {
		type: String,
		required: true,
		trim: true,
		maxlength: 1000,
		lowercase: true,
	},
	quantityOfStock: {
		type: Number,
		required: true,
		min: 0,
	},
	categoryId: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
		required: true,
	},
	sellerId: {
		type: Schema.Types.ObjectId,
		ref: 'Seller',
		required: true,
	},
	images: [
		{
			type: String,
			required: true,
		},
	],
	guarantyTime: {
		type: Number,
		required: true,
		min: 0,
	},
	guarantyType: {
		type: String,
		required: true,
		enum: ['importer', 'manufacturer', 'none'],
		lowercase: true,
	},
	numberOfComments: {
		type: Number,
		min: 0,
		default: 0,
	},
	numberOfRating: {
		type: Number,
		required: true,
		min: 0,
		default: 0,
	},
	ratingsCount: [
		{
			rate: {
				type: Number,
				required: true,
				min: 0,
				max: 5,
			},
			count: {
				type: Number,
				required: true,
				default: 0,
				min: 0,
			},
		},
	],
	averageRating: {
		type: Number,
		default: 0,
		min: 0,
		max: 5,
	},
	cargoPrice: {
		type: Number,
		min: 0,
		default: 0,
	},
	freeCargo: {
		type: Boolean,
		default: false,
	},
	deliveryTime: {
		type: Number,
		required: true,
		min: 0,
	},
	viewCount: {
		type: Number,
		required: true,
		min: 0,
		default: 0,
	},
	saleCount: {
		type: Number,
		min: 0,
		default: 0,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
	featuresId: {
		type: Schema.Types.ObjectId,
		ref: 'Features',
	},
})

ProductSchema.pre<ProductSchemFields>(/^find/, function (next) {
	this.populate({
		path: 'categoryId',
		select: 'categoryName categorySlug -_id',
	})

	next()
})

ProductSchema.pre<ProductSchemFields>('save', function (next) {
	const ratings = [
		{
			rate: 5,
			count: 0,
		},
		{
			rate: 4,
			count: 0,
		},
		{
			rate: 3,
			count: 0,
		},
		{
			rate: 2,
			count: 0,
		},
		{
			rate: 1,
			count: 0,
		},
	]

	ratings.forEach((rating) => {
		this.ratingsCount.push(rating)
	})

	next()
})

const Product = model<ProductSchemFields>('Product', ProductSchema)

export default Product
