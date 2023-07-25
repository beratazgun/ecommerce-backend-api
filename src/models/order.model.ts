import { Schema, model } from 'mongoose'
import crypto from 'crypto'

export interface OrderSchemaFields {
	orderId: string
	customerId: Schema.Types.ObjectId
	products: {
		productId: Schema.Types.ObjectId
		quantity: number
	}
	shippingAddress: Schema.Types.ObjectId
	quantity: number
	totalPrice: number
	orderDate: Date
	cargoTrackingNumber: string
	isCanceled: boolean
	isOrderCompleted: boolean
	paymentMethod: string
	card: {
		cardNumber: string
		cardHolderName: string
		cardExpireDate: {
			month: number
			year: number
		}
		cardCvv: number
	}
}

const OrdersSchema = new Schema<OrderSchemaFields>({
	orderId: {
		type: String,
		required: true,
	},
	customerId: {
		type: String,
		required: true,
	},
	products: [
		{
			productId: {
				type: String,
				required: true,
			},
			quantity: {
				type: Number,
				required: true,
			},
		},
	],
	shippingAddress: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
	},
	totalPrice: {
		type: Number,
		required: true,
	},
	paymentMethod: {
		type: String,
		required: true,
		enum: ['creditCard', 'cash', 'debitCard'],
	},
	card: {
		cardNumber: {
			type: String,
			required: true,
		},
		cardHolderName: {
			type: String,
			required: true,
		},
		cardExpireDate: {
			month: {
				type: Number,
				required: true,
			},
			year: {
				type: Number,
				required: true,
			},
		},
		cardCvv: {
			type: Number,
			required: true,
		},
	},
	isCanceled: {
		type: Boolean,
		default: false,
	},
	isOrderCompleted: {
		type: Boolean,
		default: false,
	},
	orderDate: {
		type: Date,
		default: Date.now,
	},
})

const Order = model<OrderSchemaFields>('Order', OrdersSchema)

export default Order
