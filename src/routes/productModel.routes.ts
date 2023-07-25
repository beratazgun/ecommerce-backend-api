import { Router } from 'express'
import ProductModelController from '../controllers/productModel.controller'

const router: Router = Router()
const productModelController: ProductModelController =
	new ProductModelController()

// this route for create product model
router.post('/create', productModelController.createProductModel)

// this route for all product model
router.get('/all', productModelController.getAllProductModel)

// this route returns product models belonging to a certain category
router.get(
	'/all/:category',
	productModelController.getAllProductModelForCategory
)

export default router
