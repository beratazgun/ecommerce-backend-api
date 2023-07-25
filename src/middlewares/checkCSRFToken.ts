import { Middlewares } from './Middlewares'

const middlewares = new Middlewares()

const checkCSRFToken = middlewares.checkCSRFToken

export { checkCSRFToken }
