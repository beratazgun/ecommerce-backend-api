import slugify from 'slugify'
import { customAlphabet } from 'nanoid'
import Tokens from 'csrf'

function nanoIdGenerator(regex: string, size: number) {
	const nanoid = customAlphabet(regex, size)
	return nanoid()
}

function generateSlug(str: string) {
	return slugify(str, {
		lower: true,
		replacement: '-',
	})
}

function generateCSRFToken() {
	const secret = new Tokens().secretSync()
	const token = new Tokens().create(secret)

	return { secret, token }
}

export { generateSlug, nanoIdGenerator, generateCSRFToken }
