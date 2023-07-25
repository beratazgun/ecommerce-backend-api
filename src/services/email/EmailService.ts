import * as nodemailer from 'nodemailer'
import * as pug from 'pug'
import path from 'path'
import { capitalize } from 'lodash'
import { Schema } from 'mongoose'

interface EmailServiceOptions {
	model: Model
	subject: string
	templateDir: string
	url?: string
	templateData?: any
}

interface Model {
	id: string
	firstName: string
	lastName: string
	phone: string | null
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
	storeId?: string | Schema.Types.ObjectId
	addressId?: string | Schema.Types.ObjectId
}

export default class EmailService {
	private transporter: nodemailer.Transporter

	constructor(public options: EmailServiceOptions) {
		this.transporter = nodemailer.createTransport({
			host: process.env.MAIL_HOST,
			port: process.env.MAIL_PORT as number | undefined,
			auth: {
				user: process.env.MAIL_USERNAME,
				pass: process.env.MAIL_PASSWORD,
			},
		})
	}

	send = async (templateDir: string, subject: string, templateData: any) => {
		const html = pug.renderFile(
			path.join(__dirname, `../../views/email/${templateDir}.pug`),
			templateData
		)

		try {
			const mailOptions = {
				from: 'Bero <bero@bytebazaar.io>',
				to: this.options.model.email,
				subject: subject,
				html: html,
			}

			await this.transporter.sendMail(mailOptions)
		} catch (error) {
			console.log(error)
		}
	}

	sendAccountConfirmationEmail = async () => {
		const { templateDir, subject, model, url } = this.options
		await this.send(templateDir, subject, {
			firstName: capitalize(model.firstName),
			lastName: capitalize(model.lastName),
			url: url,
		})
	}

	sendForgotPasswordEmail = async () => {
		const { templateDir, subject, model, url } = this.options
		await this.send(templateDir, subject, {
			firstName: capitalize(model.firstName),
			lastName: capitalize(model.lastName),
			url: url,
		})
	}

	sendPasswordChangedSuccesfullEmail = async () => {
		const { templateDir, subject, model } = this.options
		await this.send(templateDir, subject, {
			firstName: capitalize(model.firstName),
			lastName: capitalize(model.lastName),
		})
	}

	sendCheckYourDocuments = async () => {
		const { templateDir, subject, model } = this.options
		await this.send(templateDir, subject, {
			firstName: capitalize(model.firstName),
			lastName: capitalize(model.lastName),
		})
	}
}
