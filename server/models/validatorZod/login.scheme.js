import { z } from 'zod'

export const loginSchema = z.object({
	email: z
		.string({
			required_error: 'Email is required',
		})
		.email({
			message: 'Email is invalid',
		}),

	password: z
		.string({
			required_error: 'Password is required',
		})
		.min(8, {
			message: 'Password must be at 8 characters',
		}),
})

export const registerSchema = z.object({
	username: z
		.string({
			required_error: 'Username is required',
		})
		.min(8, {
			message: 'Username must be at 8 characters',
		}),

	email: z
		.string({
			required_error: 'Email is required',
		})
		.email({
			message: 'Email is invalid',
		}),

	password: z
		.string({
			required_error: 'Password is required',
		})
		.min(8, {
			message: 'Password must be at 8 characters',
		}),
})
