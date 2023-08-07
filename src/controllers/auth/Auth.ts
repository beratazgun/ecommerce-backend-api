import { Request, Response, NextFunction } from 'express'
import AsyncCatchError from '../../utils/AsyncCatchError'
import createHttpError from 'http-errors'
import { LoginData, forgotPasswordData, updatePasswordData } from './interface'
import mongoose from 'mongoose'
import EmailService from '../../services/email/EmailService'
import { redisConnection } from '../../services/redis/redisConnection'
import { SellerSchemaFields } from '../../models/seller.model'
import { CustomerSchemaFields } from '../../models/customer.model'
import { sendCSRFToken } from '../../utils/sendCSRFToken'

export interface ModelInterface
	extends SellerSchemaFields,
		CustomerSchemaFields {}

export default abstract class Auth {
	abstract Model: string

	signin = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { email, password }: LoginData = req.body

			const model: ModelInterface = (await mongoose
				.model(this.Model)
				.findOne({ email })
				.select('+password')) as ModelInterface

			if (!model || !(await model.isMatchPassword(password, model.password))) {
				return next(
					createHttpError.BadRequest('Email or password is incorrect.')
				)
			}

			if (!model.isAccountActive) {
				return next(
					createHttpError.BadRequest(
						'Your account is not active. Please check your email to confirm your account.'
					)
				)
			}

			let storeData: any = {}
			if (model.role === 'seller') {
				storeData = await mongoose
					.model('Store')
					.findOne({ sellerId: model._id })

				req.session.user = {
					_id: model._id,
					firstName: model.firstName,
					lastName: model.lastName,
					email: model.email,
					role: model.role,
					phone: model.phone,
					address: model.address,
					createdAt: model.createdAt,
					updatedAt: model.updatedAt,
					store: {
						storeName: storeData.storeName,
						storeLogo: storeData.storeLogo,
						storeDescription: storeData.storeDescription,
						storeAddress: storeData.storeAddress,
						phone: storeData.sellerId.phone,
						storeRating: storeData.storeRating,
					},
				}
			} else {
				req.session.user = model
			}

			sendCSRFToken(res, req)

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message: 'You have been logged in successfully.',
			})
		}
	)

	confirmAccount = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { token } = req.params
			const model = await mongoose.model(this.Model).findOne({
				$and: [
					{ confirmToken: token },
					{ confirmTokenExpires: { $gt: Date.now() } },
				],
			})

			if (!model) {
				return next(
					createHttpError.NotFound('Token is invalid or has expired.')
				)
			} else {
				await mongoose.model(this.Model).findByIdAndUpdate(
					{ _id: model._id },
					{
						isAccountActive: true,
						$unset: {
							confirmToken: 1,
							confirmTokenExpires: 1,
						},
					}
				)

				if (this.Model === 'Seller') {
					const emailService = new EmailService({
						model: model,
						subject: 'About Reviewing Your Information | ByteBazaar',
						templateDir: 'seller/checkingYourDoc',
					})
					await emailService.sendCheckYourDocuments()
				}

				res.status(200).json({
					status: 'success',
					isSuccess: true,
					message: 'Your account has been activated successfully.',
				})
			}
		}
	)

	isLoggedIn = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const sesID = req.cookies?.sesID?.slice(2).split('.')[0] || req.sessionID

			const model = await redisConnection.get(`sesID#${sesID}`)

			if (!model) {
				return next(
					createHttpError.Unauthorized('You are not logged in. Please Sign in')
				)
			}

			res.locals.user = JSON.parse(model).user
			next()
		}
	)

	getMe = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const currentUser = res.locals.user

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				result: currentUser,
			})
		}
	)

	checkCSRFToken = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { csrfToken } = req.session

			if (!csrfToken) {
				return next(
					createHttpError.Unauthorized(
						'csrf token is missing. Please logout and login again.'
					)
				)
			}

			if (req.cookies.csrfToken !== csrfToken) {
				return next(
					createHttpError.Unauthorized(
						'csrf token is invalid. Please logout and login again.'
					)
				)
			}

			next()
		}
	)

	checkAuthorization = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { role } = req.session.user

			console.log(role)
			console.log(req.session)

			if (role === 'customer') {
				return next(
					createHttpError.BadRequest(
						'You do not have permission to perform this action.'
					)
				)
			}

			next()
		}
	)

	logout = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			req.session.destroy((err) => {
				if (err) {
					return next(createHttpError.InternalServerError())
				}
				res.clearCookie('sesID')
				res.status(200).json({
					status: 'success',
					isSuccess: true,
					message: 'You have been logged out successfully.',
				})
			})
		}
	)

	forgotPassword = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { email }: { email: string } = req.body

			const model = await mongoose.model(this.Model).findOne({ email })

			if (!model) {
				return next(
					createHttpError.BadRequest(
						'There is no user with that email address.'
					)
				)
			}

			model.createPasswordResetToken()
			await model.save({ validateBeforeSave: false })

			const emailService = new EmailService({
				model: model,
				subject: 'Password Reset Token | ByteBazaar',
				templateDir: 'forgotPasswordEmail',
				url: `${process.env.APP_URL}/ap/reset-password/${model.passwordResetToken}`,
			})
			await emailService.sendForgotPasswordEmail()

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message:
					'Your password reset token has been sent to your email address.',
			})
		}
	)

	resetPassword = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { token } = req.params
			const { newPassword, newPasswordConfirm }: forgotPasswordData = req.body

			const model = await mongoose
				.model(this.Model)
				.findOne({
					$and: [
						{ passwordResetToken: token },
						{ passwordResetTokenExpires: { $gt: Date.now() } },
					],
				})
				.select('+password')

			if (!model) {
				return next(
					createHttpError.NotFound('Token is invalid or has expired.')
				)
			} else {
				if (await model.isMatchPassword(newPassword, model.password)) {
					return next(
						createHttpError.BadRequest(
							'Your new password must be different from your current password.'
						)
					)
				}

				model.password = newPassword
				model.passwordConfirm = newPasswordConfirm
				model.passwordResetToken = undefined
				model.passwordResetTokenExpires = undefined
				await model.save({
					validateBeforeSave: true,
				})

				const emailService = new EmailService({
					model: model,
					subject: 'Password Reset Successful | ByteBazaar',
					templateDir: 'passwordUpdateSuccess',
				})
				await emailService.sendPasswordChangedSuccesfullEmail()

				res.status(200).json({
					status: 'success',
					isSuccess: true,
					message: 'Your password has been reset successfully.',
				})
			}
		}
	)

	updatePassword = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { _id } = req.session.user
			const { user } = res.locals
			const {
				currentPassword,
				newPassword,
				newPasswordConfirm,
			}: updatePasswordData = req.body

			if (currentPassword === newPassword) {
				return next(
					createHttpError.BadRequest(
						'Your new password must be different from your current password.'
					)
				)
			}

			if (_id !== user.id) {
				return next(
					createHttpError.BadRequest(
						'You are not authorized to perform this action.'
					)
				)
			}

			const model = await mongoose
				.model(this.Model)
				.findById(_id)
				.select('+password')

			if (!model) return next()

			model.password = newPassword
			model.passwordConfirm = newPasswordConfirm
			await model.save({
				validateBeforeSave: true,
			})

			const emailService = new EmailService({
				model: model,
				subject: 'Password Update Successful | ByteBazaar',
				templateDir: 'passwordUpdateSuccess',
			})
			await emailService.sendPasswordChangedSuccesfullEmail()

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message: 'Your password has been updated successfully.',
			})
		}
	)

	resendVerificationEmail = AsyncCatchError(
		async (req: Request, res: Response, next: NextFunction) => {
			const { email }: { email: string } = req.body

			const model = await mongoose.model(this.Model).findOne({ email })

			if (!model) {
				return next(
					createHttpError.BadRequest(
						'There is no user with that email address.'
					)
				)
			}

			if (model.isVerified) {
				return next(
					createHttpError.BadRequest('Your account is already verified.')
				)
			}

			await mongoose.model(this.Model).findByIdAndUpdate(model.id, {
				...model.createConfirmToken(),
			})

			const emailService = new EmailService({
				model: model,
				subject: 'Account Verification Token | ByteBazaar',
				templateDir: 'emailConfirm',
				url: `${process.env.APP_URL}/ap/verify-account/${model.verificationToken}`,
			})
			await emailService.sendAccountConfirmationEmail()

			res.status(200).json({
				status: 'success',
				isSuccess: true,
				message:
					'Your account verification token has been sent to your email address.',
			})
		}
	)
}
