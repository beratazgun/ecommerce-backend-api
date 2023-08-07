import { Router } from 'express'
import AddressController from '../controllers/address.controller'
import { isLoggedIn, checkCSRFToken } from '../middlewares'

const router: Router = Router()
const addressController: AddressController = new AddressController()

router.use(isLoggedIn, checkCSRFToken)

router.post('/account/me/add', addressController.createAddress)

router.delete('/account/me/delete', addressController.deleteAddress)

router.patch('/account/me/update', addressController.updateAddress)
router.get('/account/me/getall', addressController.getAllAddress)

export default router
