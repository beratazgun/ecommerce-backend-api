import { app } from './app'
import mongoose from 'mongoose'

const port: number = Number(process.env.PORT) || 3000

//! Cloud MongoDB
// const mongodbUrl: string = (process.env.MONGODB_ATLAS_URL as string).replace(
// 	'<password>',
// 	process.env.MONGODB_ATLAS_PW as string
// )

// mongoose
// 	.connect(mongodbUrl, {
// 		autoIndex: true,
// 	})
// 	.then((): void => console.log('Connected to ATLAS MongoDB! 🚀🚀🚀'))
// 	.catch((err: Error): void => console.log(err))

//! Local MongoDB
mongoose
	.set('autoIndex', true)
	.connect(process.env.MONGODB_LOCAL_URL as string, {
		autoIndex: true,
	})
	.then((): void => {
		console.log('Connected to LOCAL MongoDB! 🚀🚀🚀')
	})
	.catch((err: Error): void => {
		console.log(err)
	})

app.listen(port, (): void => console.log(`Listening on port ${port}! 🎧🎧🎧`))
