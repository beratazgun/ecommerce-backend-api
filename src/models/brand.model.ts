import { Schema, model, Document } from 'mongoose'
import { nanoIdGenerator, generateSlug } from '../utils/generator'

export interface brandSchemaFields extends Document {
	brand: string
	brandSlug: string
	brandId: string
	logoİmage: string
	createdAt: Date
	updatedAt: Date
}

const BrandSchema = new Schema<brandSchemaFields>({
	brand: {
		type: String,
		required: [true, 'Brand name is required.'],
		lowercase: true,
		unique: true,
		trim: true,
	},
	brandSlug: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
	},
	brandId: {
		type: String,
		unique: true,
		trim: true,
	},
	logoİmage: {
		type: String,
		trim: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
})

BrandSchema.pre<brandSchemaFields>('save', function (next) {
	this.brandId = nanoIdGenerator('1234567890', 6)
	this.brandSlug = generateSlug(this.brand)
	next()
})

const Brand = model<brandSchemaFields>('Brand', BrandSchema)

export default Brand
