import { Request, Response, NextFunction } from 'express'

import Customer from '../../models/customer.model'
import AsyncCatchError from '../../utils/AsyncCatchError'
import EmailService from '../../services/email/EmailService'
import Auth from './Auth'

export default class CustomerController extends Auth {
	Model = 'Customer'

	constructor() {
		super()
	}

	signup = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const customer = await Customer.create(req.body)

			const emailService = new EmailService({
				model: customer,
				subject: 'Account Verification | ByteBazaar',
				templateDir: 'emailConfirm',
				url: `${process.env.APP_URL}/verify/confirm-account/${customer.confirmToken}`,
			})
			await emailService.sendAccountConfirmationEmail()

			res.status(201).json({
				status: 'success',
				isSuccess: true,
				message:
					'Your account has been created successfully. Please check your email to confirm your account.',
			})
		}
	)
}
