import { Router } from 'express'
import CustomerController from '../controllers/auth/customer.contoller'
import { checkCSRFToken, isLoggedIn } from '../middlewares'

const router: Router = Router()
const customerController: CustomerController = new CustomerController()

// this route is going to signup new user
router.post('/auth/signup', customerController.signup)

// this route is going to signin existing user
router.post('/auth/signin', customerController.signin)
// this route is going to confirm account by verifying token sent to user's email
router.post('/verify/confirm-account/:token', customerController.confirmAccount)

// this route is going to resend verification email
router.post(
	'/resend-verification-email',
	customerController.resendVerificationEmail
)

// this middleware will check if user is logged in or not, if not then it will throw error. then it will check if csrf token is valid or not, if not then it will throw error
router.use(isLoggedIn, checkCSRFToken)

// this will send forgot password email
router.post('/forgot-password', customerController.forgotPassword)
// this will reset password
router.patch('/reset-password/:token', customerController.resetPassword)

// this route is going to get current logged in user
router.get('/account/me', customerController.getMe)
// this route is going to logout current logged in user
router.post('/account/logout', customerController.logout)
// this route is going to update password but just for logged in user
router.post('/account/me/update-password', customerController.updatePassword)

export default router
