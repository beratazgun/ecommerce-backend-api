import { Schema, model, Document } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export interface SellerSchemaFields extends Document {
	id: string
	firstName: string
	lastName: string
	phone: string
	email: string
	password: string
	passwordConfirm: string | undefined
	role: string
	createdAt: Date
	updatedAt: Date
	isAccountActive: boolean
	confirmToken: string | undefined
	confirmTokenExpires: Date
	passwordResetToken: string | undefined
	passwordResetTokenExpires: Date | undefined
	passwordChangedAt: Date
	storeId: Schema.Types.ObjectId
	address: Schema.Types.ObjectId[]
	isMatchPassword: (
		enteredPassword: string,
		passwordİnDatabase: string
	) => Promise<boolean>
	createPasswordResetToken: () => string
}

const SellerSchema = new Schema<SellerSchemaFields>({
	firstName: {
		type: String,
		required: [true, 'First name is required.'],
		lowercase: true,
		trim: true,
		validate: [validator.isAlpha, 'First name must only contain characters.'],
	},
	lastName: {
		type: String,
		required: [true, 'Last name is required.'],
		lowercase: true,
		trim: true,
		validate: [validator.isAlpha, 'Last name must only contain characters.'],
	},
	email: {
		index: true,
		type: String,
		required: [true, 'Please provide your email'],
		unique: true,
		trim: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email'],
	},
	phone: {
		index: true,
		type: String,
		unique: true,
		required: [true, 'Please provide your phone number'],
		trim: true,
		validate: [validator.isMobilePhone, 'Please provide a valid phone number'],
	},
	password: {
		type: String,
		required: [true, 'Password is required.'],
		trim: true,
		validate: [
			validator.isStrongPassword,
			'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.',
		],
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Password confirmation is required.'],
		trim: true,
		validate: {
			validator: function (el: string): boolean {
				return el === (this as any).password
			},
			message: 'Passwords are not the same',
		},
	},
	role: {
		type: String,
		default: 'seller',
	},
	storeId: {
		type: Schema.Types.ObjectId,
		ref: 'Store',
	},
	address: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Address',
		},
	],
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	updatedAt: {
		type: Date,
		default: Date.now(),
	},
	isAccountActive: {
		type: Boolean,
		default: false,
	},
	confirmToken: {
		type: String,
	},
	confirmTokenExpires: {
		type: Date,
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetTokenExpires: Date,
})

SellerSchema.pre<SellerSchemaFields>('save', async function (next) {
	if (!this.isModified('password')) return next() // if password is not modified, do nothing
	// if password is modified, hash the password

	this.password = await bcrypt.hash(this.password, 12)
	this.passwordConfirm = undefined // this is to remove the passwordConfirm field from the database

	next()
})

SellerSchema.pre<SellerSchemaFields>('save', function (next) {
	if (!this.isAccountActive) {
		const token = crypto.randomBytes(32).toString('hex') // unencrypted token
		this.confirmToken = crypto.createHash('sha256').update(token).digest('hex') // encrypted token
		this.confirmTokenExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
	}
	next()
})

SellerSchema.methods.isMatchPassword = async function (
	enteredPassword: string,
	passwordİnDatabase: string
): Promise<boolean> {
	return await bcrypt.compare(enteredPassword, passwordİnDatabase)
}

SellerSchema.methods.createPasswordResetToken = function (): string {
	const token = crypto.randomBytes(32).toString('hex') // unencrypted token
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(token)
		.digest('hex') // encrypted token
	this.passwordResetTokenExpires = Date.now() + 15 * 60 * 1000 // 15 minutes
	return token
}

const Seller = model<SellerSchemaFields>('Seller', SellerSchema)

export default Seller
