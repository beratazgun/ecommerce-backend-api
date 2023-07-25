import { Router } from 'express'
import SellerController from '../controllers/auth/seller.controller'
import { checkCSRFToken, isLoggedIn } from '../middlewares'

const router: Router = Router()
const sellerController: SellerController = new SellerController()

// this route is going to signup new user
router.post('/signup', sellerController.signup)

// this route is going to signin existing user
router.post('/signin', sellerController.signin)

// this route is going to confirm account by verifying token sent to user's email
router.post('/verify/confirm-account/:token', sellerController.confirmAccount)

// this will send forgot password email
router.post('/forgot-password', sellerController.forgotPassword)
// this will reset password but just For users who forgot their password
router.patch('/reset-password/:token', sellerController.resetPassword)

// this middleware will check if user is logged in or not, if not then it will throw error. then it will check if csrf token is valid or not, if not then it will throw error
router.use(isLoggedIn, checkCSRFToken)

// this route is going to get current logged in user
router.get('/account/me', sellerController.getMe)
// this route is going to logout current logged in user
router.post('/logout', sellerController.logout)
// this route is going to update password but just for logged in user
router.post('/account/me/update-password', sellerController.updatePassword)

export default router
