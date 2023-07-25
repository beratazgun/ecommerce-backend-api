import { Router } from 'express'
import CartController from '../controllers/cart.controller'
import { isLoggedIn, checkCSRFToken } from '../middlewares'

const router: Router = Router()
const cartController: CartController = new CartController()

router.use(isLoggedIn, checkCSRFToken)

router.post('/add', cartController.addToCart)
router.get('/get', cartController.getCart)
router.get('/get/count', cartController.getItemCounts)
router.delete('/delete', cartController.deleteFromCart)

export default router
