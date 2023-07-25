import { Middlewares } from './Middlewares'

const middlewares = new Middlewares()

const checkAuthorization = middlewares.checkAuthorization

export { checkAuthorization }
