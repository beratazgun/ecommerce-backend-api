import { Schema, model, Document } from 'mongoose'

export interface ReviewSchemaFields extends Document {
	customerId: Schema.Types.ObjectId
	productId: Schema.Types.ObjectId
	rating: number
	review: string
	createdAt: Date
	updatedAt: Date
}

const ReviewSchema = new Schema<ReviewSchemaFields>({
	review: {
		type: String,
		required: true,
		lowercase: true,
	},
	rating: {
		type: Number,
		required: true,
		min: 0,
		max: 5,
	},
	customerId: {
		type: Schema.Types.ObjectId,
		ref: 'Customer',
		required: true,
	},
	productId: {
		type: Schema.Types.ObjectId,
		ref: 'Product',
		required: true,
	},
})

const Review = model<ReviewSchemaFields>('Review', ReviewSchema)

export default Review
