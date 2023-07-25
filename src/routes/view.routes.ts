import { Router } from 'express'
import axios from 'axios'
import pug from 'pug'
import path from 'path'

const router: Router = Router()

router.get('/verify/confirm-account/:token', async (req, res, next) => {
	try {
		await axios.post(
			`${process.env.APP_URL}/api/v1/auth/customer/verify/confirm-account/${req.params.token}`
		)
		res.send('Your account has been confirmed. You can login now')
	} catch (error) {
		res.send('Something went wrong. Please try again later.')
	}
})

router.get('/ap/reset-password/:token', async (req, res, next) => {
	pug.renderFile(
		path.join(__dirname, '../views/password-reset/passwordResetPage.pug'),
		(err, html) => {
			if (!err) res.send(html)
		}
	)
})

export default router
