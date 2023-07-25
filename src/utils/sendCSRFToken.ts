import { generateCSRFToken } from './generator'
import { Response, Request } from 'express'

function sendCSRFToken(res: Response, req: Request) {
	const { token } = generateCSRFToken()

	res.cookie('csrfToken', token, {
		httpOnly: true,
		sameSite: 'strict',
	})

	req.session.csrfToken = token
}

export { sendCSRFToken }
