import { Router } from 'express'
import FormFieldsController from '../controllers/formFields.controller'

const router: Router = Router()
const formFieldsController = new FormFieldsController()

router.post('/create', formFieldsController.createFormFields)
router.get('/get/:category', formFieldsController.getFormFields)

export default router
