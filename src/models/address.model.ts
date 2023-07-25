import { Schema, model, Document } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export interface AddressSchemaFields extends Document {
	addressTitle: string
	firstName: string
	lastName: string
	phone: string
	city: string
	street: string
	district: string
	neighborhood: string
	address: string
	sellerId: Schema.Types.ObjectId | null
	customerId: Schema.Types.ObjectId | null
}

const AddressSchema = new Schema<AddressSchemaFields>({
	addressTitle: {
		type: String,
		required: [true, 'Address title is required.'],
		lowercase: true,
		trim: true,
	},
	firstName: {
		type: String,
		lowercase: true,
		trim: true,
	},
	lastName: {
		type: String,
		lowercase: true,
		trim: true,
	},
	phone: {
		type: String,
		lowercase: true,
		trim: true,
	},
	city: {
		type: String,
		lowercase: true,
		trim: true,
	},
	street: {
		type: String,
		lowercase: true,
		trim: true,
	},
	district: {
		type: String,
		lowercase: true,
		trim: true,
	},
	neighborhood: {
		type: String,
		lowercase: true,
		trim: true,
	},
	address: {
		type: String,
		lowercase: true,
		trim: true,
		maxlength: [250, 'Address can not be more than 250 characters.'],
	},
	sellerId: {
		type: Schema.Types.ObjectId,
		ref: 'Seller',
	},
	customerId: {
		type: Schema.Types.ObjectId,
		ref: 'Customer',
	},
})

const Address = model<AddressSchemaFields>('Address', AddressSchema)

export default Address
