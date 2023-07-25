import dotenv from 'dotenv'
dotenv.config()
import path from 'path'
import bodyParser from 'body-parser'
import express, { Express } from 'express'
import cookieParser from 'cookie-parser'
import sessions from 'express-session'
import { client } from './services/redis/client'
import RedisStore from 'connect-redis'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'
import createHttpError from 'http-errors'

import { ThrowGlobalError } from './controllers/error.controller'
import customerRoutes from './routes/customer.routes'
import sellerRoutes from './routes/seller.routes'
import productRoutes from './routes/product.routes'
import categoryRoutes from './routes/category.routes'
import addressRoutes from './routes/address.routes'
import viewRoutes from './routes/view.routes'
import reviewRoutes from './routes/review.routes'
import orderRoutes from './routes/order.routes'
import cartRoutes from './routes/cart.routes'
import favoriteRoutes from './routes/favorite.routes'
import brandRoutes from './routes/brand.routes'
import productModelRoutes from './routes/productModel.routes'
import filterRoutes from './routes/filter.routes'
import formFieldsRoutes from './routes/formFields.routes'
import Auth from './controllers/auth/Auth'

const app: Express = express()

app.use(morgan('dev'))

app.use(bodyParser.json())
app.use(cookieParser())

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(
	cors({
		credentials: true, // This is important.
		origin: [
			'http://localhost:3000',
			'http://localhost:3001',
			'http://localhost:3005',
			'*',
		],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	})
)

app.use(
	sessions({
		store: new RedisStore({
			client: client,
			prefix: 'sesID#',
		}),
		name: 'sesID',
		secret: 'bytebazaarsecret',
		cookie: {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24, // 24 hours
			secure: false,
		},
		resave: true,
		saveUninitialized: false,
	})
)

app.use(mongoSanitize())

app.use(
	helmet({
		xssFilter: true, // XSS attack
		frameguard: true, // Clickjacking
		hsts: true, // HTTP Strict Transport Security
		noSniff: true, // MIME sniffing
		hidePoweredBy: true, // Hide X-Powered-By
	})
)

// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000, // 15 minutes
// 	max: 240, // Limit each IP to 120 requests per `window` (here, per 15 minutes)
// 	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
// 	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// })

// Apply the rate limiting middleware to all requests
// app.use(limiter)

app.use('/api/v1/auth/customer', customerRoutes)
app.use('/api/v1/auth/seller', sellerRoutes)
app.use('/api/v1/product', productRoutes)
app.use('/api/v1/category', categoryRoutes)
app.use('/api/v1/address', addressRoutes)
app.use('/api/v1/review', reviewRoutes)
app.use('/api/v1/order', orderRoutes)
app.use('/api/v1/favorite', favoriteRoutes)
app.use('/api/v1/cart', cartRoutes)
app.use('/api/v1/brand', brandRoutes)
app.use('/api/v1/product-model', productModelRoutes)
app.use('/api/v1/filter', filterRoutes)
app.use('/api/v1/form-fields', formFieldsRoutes)
app.use('/', viewRoutes)

app.all('*', (req, res, next) => {
	next(new createHttpError.NotFound('This route is not defined.'))
})

app.use(ThrowGlobalError)

export { app }
