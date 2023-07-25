import { Router } from 'express'
import Auth from '../controllers/auth/Auth'
import ReviewController from '../controllers/review.controller'
import { isLoggedIn } from '../middlewares'

const router: Router = Router()
const reviewController: ReviewController = new ReviewController()

router.use(isLoggedIn)

router.post('/create/:productSlug', reviewController.createReview)

router.delete('/delete-review/:id', reviewController.deleteReview)

router.patch('/update-review/:id', reviewController.updateReview)

router.get('/get-reviews/:productSlug', reviewController.getReviews)

export default router
