import { Router } from 'express'
import FilterController from '../controllers/filter.controller'

const router: Router = Router()
const filterController: FilterController = new FilterController()

router.post('/create', filterController.createFilter)
router.get('/get/:category', filterController.getFilter)

export default router
