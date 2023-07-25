import { Schema, model, Document } from 'mongoose'

export interface FilterSchemaFields extends Document {
	categoryId: Schema.Types.ObjectId
	category: string
	filters: [
		{
			filterName: string
			beautifulFilterName: string
			filterValues: [
				{
					values: any
				}
			]
			beautifulFilterValues: [
				{
					values: any
				}
			]
			appendixName?: string[]
		}
	]
}

const FilterSchema = new Schema<FilterSchemaFields>({
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
	filters: [
		{
			filterName: {
				type: String,
				required: [true, 'Filter name is required.'],
				trim: true,
			},
			beautifulFilterName: {
				type: String,
				required: [true, 'Beautiful name is required.'],
				lowercase: true,
				trim: true,
			},
			filterValues: {
				type: Schema.Types.Mixed,
			},
			beautifulFilterValues: [
				{
					type: Schema.Types.Mixed,
					default: [''],
				},
			],
			appendixName: [
				{
					type: String,
					trim: true,
					lowercase: true,
					default: ' ',
				},
			],
		},
	],
})

const Filter = model<FilterSchemaFields>('Filter', FilterSchema)

export default Filter
