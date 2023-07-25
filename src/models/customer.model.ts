import { Schema, model, Document } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { NextFunction } from 'express'

export interface CustomerSchemaFields extends Document {
	id: string
	firstName: string
	lastName: string
	phone: string
	email: string
	password: string
	passwordConfirm: string | undefined
	role: string
	address: Schema.Types.ObjectId[]
	createdAt: Date
	updatedAt: Date
	isAccountActive: boolean
	confirmToken: string | undefined
	confirmTokenExpires: Date
	passwordResetToken: string | undefined
	passwordResetTokenExpires: Date | undefined
	passwordChangedAt: Date
	isMatchPassword: (
		enteredPassword: string,
		passwordİnDatabase: string
	) => Promise<boolean>
	createPasswordResetToken: () => string
	createConfirmToken: () => string
}

const CustomerSchema = new Schema<CustomerSchemaFields>({
	firstName: {
		type: String,
		required: [true, 'First name is required.'],
		lowercase: true,
		trim: true,
	},
	lastName: {
		type: String,
		required: [true, 'Last name is required.'],
		lowercase: true,
		trim: true,
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
		trim: true,
		sparse: true,
		validate: [validator.isMobilePhone, 'Please provide a valid phone number'],
	},
	password: {
		type: String,
		required: [true, 'Password is required.'],
		trim: true,
		validate: {
			validator: function (el: string) {
				return validator.isStrongPassword(el, {
					minLength: 7,
				})
			},
			message:
				'Password must be at least 7 characters and at most 64 characters, contain letters, numbers and special characters',
		},
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
		default: 'customer',
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

CustomerSchema.pre<CustomerSchemaFields>('save', async function (next) {
	if (!this.isModified('password')) return next() // if password is not modified, do nothing

	// if password is modified, hash the password
	this.password = await bcrypt.hash(this.password, 12)
	this.passwordConfirm = undefined // this is to remove the passwordConfirm field from the database

	next()
})

CustomerSchema.methods.createConfirmToken = function (): {
	confirmToken: string
	confirmTokenExpires: Date
} {
	const token = crypto.randomBytes(32).toString('hex') // unencrypted token
	const confirmToken = crypto.createHash('sha256').update(token).digest('hex') // encrypted token
	const confirmTokenExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

	return {
		confirmToken,
		confirmTokenExpires,
	}
}

CustomerSchema.pre<CustomerSchemaFields>('save', function (next) {
	if (!this.isAccountActive) {
		const { confirmToken, confirmTokenExpires } =
			CustomerSchema.methods.createConfirmToken()
		this.confirmToken = confirmToken
		this.confirmTokenExpires = confirmTokenExpires
	}
	next()
})

CustomerSchema.methods.isMatchPassword = async function (
	enteredPassword: string,
	passwordİnDatabase: string
): Promise<boolean> {
	return await bcrypt.compare(enteredPassword, passwordİnDatabase)
}

CustomerSchema.methods.createPasswordResetToken = function (): string {
	const token = crypto.randomBytes(32).toString('hex') // unencrypted token
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(token)
		.digest('hex') // encrypted token
	this.passwordResetTokenExpires = Date.now() + 15 * 60 * 1000 // 15 minutes
	return token
}

const Customer = model<CustomerSchemaFields>('Customer', CustomerSchema)

export default Customer
