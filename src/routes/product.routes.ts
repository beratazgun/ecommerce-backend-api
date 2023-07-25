import { Router } from 'express'
import ProductController from '../controllers/product/product.controller'
import { isLoggedIn, checkAuthorization, checkCSRFToken } from '../middlewares'

const router: Router = Router()
const productController: ProductController = new ProductController()

router.get('/all', productController.getAllProducts)
router.get('/get-one/:slug', productController.getProduct)
router.get('/product-group/:slug', productController.getProductGroup)

// this middleware will run for all the routes below.
router.use(isLoggedIn, checkAuthorization, checkCSRFToken)

// this route for create product
router.post('/create', productController.createProduct)

// this route for delete product
router.delete('/delete/:slug', productController.deleteProduct)

// this route for update product
router.patch('/update/:slug', productController.updateProduct)

// this route for add product to favorite
router.get('/my-products', productController.getSellersProducts)

export default router
