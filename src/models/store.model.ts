import { Schema, model, Document } from 'mongoose'

export interface StoreSchemaFields extends Document {
	storeName: string
	storeDescription: string
	storeLogo: string
	storeBanner: string
	IBANNumber: string
	companyType: string
	storeRating: number
	cargoDeliveryTime: string
	cargoCompany: string[]
	mersisNo: string
	TurkishIdentityNumber: string
	invoiceType: string
	kepAddress: string
	sellerId: Schema.Types.ObjectId
}

const StoreSchema = new Schema<StoreSchemaFields>({
	storeName: {
		type: String,
		required: [true, 'Store name is required.'],
		lowercase: true,
		trim: true,
	},
	storeDescription: {
		type: String,
		required: [true, 'Store description is required.'],
		lowercase: true,
		trim: true,
	},
	storeLogo: {
		type: String,
		required: [true, 'Store logo is required.'],
		lowercase: true,
		trim: true,
	},
	storeRating: {
		type: Number,
		default: 10,
		min: 0,
		max: 10,
	},
	storeBanner: {
		type: String,
		required: [true, 'Store banner is required.'],
		lowercase: true,
		trim: true,
	},
	IBANNumber: {
		type: String,
		required: [true, 'IBAN number is required.'],
		lowercase: true,
		trim: true,
	},
	companyType: {
		type: String,
		required: [true, 'Company type is required.'],
		lowercase: true,
		trim: true,
		enum: ['sole proprietorship', 'limited company', 'joint stock company'],
	},
	cargoDeliveryTime: {
		type: String,
		required: [true, 'Cargo delivery time is required.'],
		lowercase: true,
		trim: true,
		enum: ['1-2', '3-5', '5-7'],
	},
	cargoCompany: {
		type: [String],
		required: [true, 'Cargo company is required.'],
		lowercase: true,
		trim: true,
		enum: [
			'kolay gelsin',
			'aras kargo',
			'trendyol express',
			'yurtiçi kargo',
			'sürat kargo',
			'ups',
			'dhl',
			'fedex',
			'mng kargo',
			'ptt kargo',
		],
	},
	mersisNo: {
		type: String,
		required: [true, 'Mersis number is required.'],
		lowercase: true,
		trim: true,
		validate: {
			validator: function (v: string) {
				return /\d{16}/.test(v)
			},
			message: (props) =>
				`${props.value} is not a valid mersis number! It must be 16 digits.`,
		},
	},
	TurkishIdentityNumber: {
		type: String,
		required: [true, 'Turkish identity number is required.'],
		lowercase: true,
		trim: true,
		validate: {
			validator: function (v: string) {
				return /\d{11}/.test(v)
			},
			message: (props) =>
				`${props.value} is not a valid Turkish identity number! It must be 11 digits.`,
		},
	},
	invoiceType: {
		type: String,
		required: [true, 'Invoice type is required.'],
		lowercase: true,
		trim: true,
		enum: [
			'e-invoice',
			'paper invoice',
			'waybill invoice',
			'proforma invoice.',
		],
	},
	kepAddress: {
		type: String,
		required: [true, 'Kep address is required.'],
		lowercase: true,
		trim: true,
		validate: {
			validator: function (v: string) {
				return /\w+@\w+\.\w+/.test(v)
			},
			message: (props) =>
				`${props.value} is not a valid kep address! It must be like 'byte.example.1@hs01.kep.tr'`,
		},
	},
	sellerId: {
		type: Schema.Types.ObjectId,
		ref: 'Seller',
		required: [true, 'Seller id is required.'],
	},
})

StoreSchema.pre<StoreSchemaFields>(/^find/, function (next) {
	this.populate({
		path: 'sellerId',
		select: '-__v -_id +storeName +storeDescription',
	})
	next()
})

const Store = model<StoreSchemaFields>('Store', StoreSchema)

export default Store
