import { CustomerSchemaFields } from '../../models/customer.model'
import { SellerSchemaFields } from '../../models/seller.model'
import { Document, Model } from 'mongoose'

export interface LoginData {
	email: string
	password: string
}

export interface forgotPasswordData {
	newPassword: string
	newPasswordConfirm: string
}

export interface updatePasswordData {
	currentPassword: string
	newPassword: string
	newPasswordConfirm: string
}
