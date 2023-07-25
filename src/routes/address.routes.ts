import { Router } from 'express'
import AddressController from '../controllers/address.controller'
import { isLoggedIn, checkCSRFToken } from '../middlewares'

const router: Router = Router()
const addressController: AddressController = new AddressController()

router.use(isLoggedIn, checkCSRFToken)

router.post('/create', addressController.createAddress)

router.delete('/delete', addressController.deleteAddress)

router.patch('/update', addressController.updateAddress)
router.get('/get/me', addressController.getAllAddress)

export default router
