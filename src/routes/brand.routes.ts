import { Router } from 'express'
import BrandController from '../controllers/brand.controller'
import Auth from '../controllers/auth/Auth'

const router: Router = Router()
const brandController = new BrandController()

router.post('/create', brandController.createBrand)
router.get('/all', brandController.getAllBrands)

export default router
