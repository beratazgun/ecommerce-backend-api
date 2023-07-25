import { Router } from 'express'
import { isLoggedIn } from '../middlewares'
import OrderController from '../controllers/order.controller'

const router: Router = Router()
const orderController: OrderController = new OrderController()

router.use(isLoggedIn)

router.post('/create', orderController.createOrder)
router.post('/cancel/:id', orderController.cancelOrder)

router.get('/my-orders', orderController.getMyOrders)

export default router
