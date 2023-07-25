import { Response, Request, NextFunction, response } from 'express'
import mongoose, { Error, MongooseError } from 'mongoose'
import { lowerCase, keys } from 'lodash'

interface responseErrorDetails {
	status: string
	isSuccess: boolean
	statusCode: number
	message: string | { [key: string]: string }
}

class ErrorController {
	constructor(public err: any, public res: Response) {}

	public handleValidationError() {
		const errorDetails: { [key: string]: string } = {}
		if (this.err instanceof mongoose.Error.ValidationError) {
			Object.values(this.err.errors).forEach((err) => {
				errorDetails[err.path] = err.message
			})

			const response: responseErrorDetails = {
				status: 'error',
				isSuccess: false,
				statusCode: 400,
				message: errorDetails,
			}
			this.sendError(response)
		}
	}

	public handleCastError() {
		console.log(this.err)
		if (this.err instanceof mongoose.Error.CastError) {
			const response: responseErrorDetails = {
				status: 'error',
				isSuccess: false,
				statusCode: 400,
				message: `Invalid ${this.err.path}: ${this.err.value}`,
			}
			this.sendError(response)
		}
	}

	public handleDuplicateFieldsDB() {
		const field: string = lowerCase(keys(this.err.keyValue)[0])
		const response: responseErrorDetails = {
			status: 'error',
			isSuccess: false,
			statusCode: 400,
			message: `This ${field} is already taken.`,
		}
		this.sendError(response)
	}

	public sendError(response: responseErrorDetails): void {
		this.res.status(response.statusCode || 500).json({
			message: response.message,
			isSuccess: response.isSuccess,
			statusCode: response.statusCode,
			status: response.status || 'error',
		})
	}
}

export const ThrowGlobalError = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errorController = new ErrorController(err, res)

	if (err.name === 'ValidationError') errorController.handleValidationError()
	else if (err.name === 'CastError') errorController.handleCastError()
	else if (err.name === 'MongoServerError')
		errorController.handleDuplicateFieldsDB()
	else {
		console.log(err)
		errorController.sendError({
			status: 'error',
			isSuccess: false,
			statusCode: err.statusCode || 500,
			message: err.message,
		})
	}

	next()
}
