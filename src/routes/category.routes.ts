import { Router } from 'express'
import CategoryController from '../controllers/category.controller'

const router: Router = Router()
const categoryController: CategoryController = new CategoryController()

router.post('/create', categoryController.createCategory)
router.get('/getall', categoryController.getAllCategories)
router.delete('/delete/:categorySlug', categoryController.deleteCategory)

export default router
