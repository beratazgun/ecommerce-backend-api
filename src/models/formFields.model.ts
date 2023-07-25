import { Schema, model, Document } from 'mongoose'

export interface FormFieldsSchemaFields extends Document {
	categoryId: Schema.Types.ObjectId
	category: string
	fields: [
		{
			type: string
			id: string
			label: string
			tagName?: string
		}
	]
}

const FormFieldsSchema = new Schema<FormFieldsSchemaFields>({
	categoryId: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
		required: [true, 'Category is required.'],
	},
	category: {
		type: String,
		required: [true, 'Category is required.'],
		lowercase: true,
		trim: true,
	},
	fields: [
		{
			type: {
				type: String,
				required: [true, 'Type is required.'],
				trim: true,
			},
			id: {
				type: String,
				required: [true, 'Id is required.'],
				trim: true,
			},
			label: {
				type: String,
				required: [true, 'Label is required.'],
				trim: true,
			},
			tagName: {
				type: String,
				trim: true,
				required: true,
			},
		},
	],
})

const FormFields = model<FormFieldsSchemaFields>('FormFields', FormFieldsSchema)

export default FormFields
