import { Schema, model, Document } from 'mongoose'
import { generateSlug } from '../utils/generator'

export interface ProductModelSchemaFields extends Document {
	model: string
	modelSlug: string
	brandId: Schema.Types.ObjectId
	categoryId: Schema.Types.ObjectId
	createdAt: Date
	updatedAt: Date
}

const productModelSchema = new Schema<ProductModelSchemaFields>({
	model: {
		type: String,
		required: true,
		trim: true,
		maxlength: 100,
		unique: true,
		lowercase: true,
	},
	modelSlug: {
		type: String,
		trim: true,
		maxlength: 100,
		unique: true,
		lowercase: true,
	},
	brandId: {
		type: Schema.Types.ObjectId,
		ref: 'Brand',
		required: true,
	},
	categoryId: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
		required: true,
	},
})

productModelSchema.pre<ProductModelSchemaFields>('save', function (next) {
	this.modelSlug = generateSlug(this.model)
	next()
})

const ProductModel = model<ProductModelSchemaFields>(
	'ProductModel',
	productModelSchema
)

export default ProductModel
