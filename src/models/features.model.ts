import { Schema, model, Document } from 'mongoose'

export interface FeaturesSchemaFields extends Document {
	productId: Schema.Types.ObjectId
	modelId: Schema.Types.ObjectId
	noticeId: string
	screen: {
		screenSize: number
		screenResulation: string
		screenResulationStandard: string
		screenTechnology: string
		pixelDensity: number
		screenRefreshRate: number
		screenWeakness: string
		screenBodyRatio: number
	}
	battery: {
		batteryCapacity: number
		quickCharge: boolean
		quickChargePower: number
		wirelessCharge: boolean
		chargeSocket: string
		batteryTechnology: string
	}
	camera: {
		cameraCount: number
		mainCamera: {
			mainCameraPixel: number
			mainCameraDiaphragm: number
		}
		frontCamera: {
			frontCameraPixel: number
			frontCameraDiaphragm: number
		}
	}
	basicHardware: {
		chipset: string
		cpuFrequency: number
		cpuCores: number
		cpuArchitecture: string
		gpu: string
		ram: number
		internalStorage: number
		externalStorage: boolean
		fiveG: boolean
		nfc: boolean
		os: string
	}
	design: {
		color: string
		material: string
		dimensions: {
			width: number
			height: number
			depth: number
		}
		weight: number
	}
}

const featuresSchema = new Schema<FeaturesSchemaFields>({
	noticeId: {
		type: String,
		required: true,
		trim: true,
		maxlength: 100,
		unique: true,
	},
	productId: {
		type: Schema.Types.ObjectId,
		ref: 'Product',
		required: true,
	},
	modelId: {
		type: Schema.Types.ObjectId,
		ref: 'ProductModel',
		required: true,
	},
	screen: {
		screenSize: {
			type: Number,
		},
		screenResulation: {
			type: String,
			lowercase: true,
		},
		screenResulationStandard: {
			type: String,
			lowercase: true,
		},
		screenTechnology: {
			type: String,
			lowercase: true,
		},
		pixelDensity: {
			type: Number,
		},
		screenRefreshRate: {
			type: Number,
		},
		screenWeakness: {
			type: String,
			lowercase: true,
		},
		screenBodyRatio: {
			type: Number,
		},
	},
	battery: {
		batteryCapacity: {
			type: Number,
		},
		quickCharge: {
			type: Boolean,
		},
		quickChargePower: {
			type: Number,
		},
		wirelessCharge: {
			type: Boolean,
		},
		chargeSocket: {
			type: String,
			lowercase: true,
		},
		batteryTechnology: {
			type: String,
			lowercase: true,
		},
	},
	camera: {
		cameraCount: {
			type: Number,
		},
		mainCamera: {
			mainCameraPixel: {
				type: Number,
				lowercase: true,
			},
			mainCameraDiaphragm: {
				type: Number,
			},
		},
		frontCamera: {
			frontCameraPixel: {
				type: Number,
				lowercase: true,
			},
			frontCameraDiaphragm: {
				type: Number,
			},
		},
	},
	basicHardware: {
		chipset: {
			type: String,
			lowercase: true,
		},
		cpuFrequency: {
			type: Number,
		},
		cpuCores: {
			type: Number,
		},
		cpuArchitecture: {
			type: String,
			lowercase: true,
		},
		gpu: {
			type: String,
			lowercase: true,
		},
		ram: {
			type: Number,
		},
		internalStorage: {
			type: Number,
		},
		externalStorage: {
			type: Boolean,
		},
		fiveG: {
			type: Boolean,
		},
		nfc: {
			type: Boolean,
		},
		os: {
			type: String,
			lowercase: true,
		},
	},
	design: {
		color: {
			type: String,
			required: true,
			lowercase: true,
		},
		material: {
			type: String,
			required: true,
			lowercase: true,
		},
		dimensions: {
			width: {
				type: Number,
				required: true,
			},
			height: {
				type: Number,
				required: true,
			},
			depth: {
				type: Number,
				required: true,
			},
		},
		weight: {
			type: Number,
			required: true,
		},
	},
})

const Features = model<FeaturesSchemaFields>('Features', featuresSchema)

export default Features
