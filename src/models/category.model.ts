import { Schema, model, Document } from 'mongoose'

export interface CategorySchemaFields extends Document {
	category: string
	categorySlug: string
	createdAt: Date
	updatedAt: Date
}

const CategorySchema = new Schema<CategorySchemaFields>({
	category: {
		type: String,
		required: [true, 'Category name is required.'],
		lowercase: true,
		unique: true,
		trim: true,
	},
	categorySlug: {
		type: String,
		unique: true,
		lowercase: true,
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

const Category = model<CategorySchemaFields>('Category', CategorySchema)

export default Category
