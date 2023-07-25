import { Middlewares } from './Middlewares'

const middlewares = new Middlewares()

const isLoggedIn = middlewares.isLoggedIn

export { isLoggedIn }
