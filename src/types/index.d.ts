declare global {
	declare module 'express-session' {
		interface SessionData {
			userId: string
			role: string
			user: any
			csrfToken: string
		}
	}
}
