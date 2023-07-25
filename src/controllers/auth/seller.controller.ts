import AsyncCatchError from '../../utils/AsyncCatchError'
import { Request, Response, NextFunction } from 'express'
import Seller from '../../models/seller.model'
import Store from '../../models/store.model'
import Address from '../../models/address.model'
import EmailService from '../../services/email/EmailService'
import Auth from './Auth'

export default class SellerController extends Auth {
	Model = 'Seller'

	signup = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { sellerİnformation, companyİnformation, addressİnformation } =
				req.body

			const seller = await Seller.create(sellerİnformation)

			const address = await Address.create({
				...addressİnformation,
				sellerId: seller._id,
			})

			const store = await Store.create({
				...companyİnformation,
				sellerId: seller._id,
				addressId: address._id,
			})

			await Seller.findByIdAndUpdate(seller._id, {
				storeId: store._id,
				$push: {
					address: address._id,
				},
			})

			const emailService = new EmailService({
				model: seller,
				subject: 'Account Verification | ByteBazaar',
				templateDir: 'emailConfirm',
				url: `${process.env.APP_URL}/verify/confirm-account/${seller.confirmToken}`,
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
