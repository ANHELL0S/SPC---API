import { z } from 'zod'

export const loginSchema = z.object({
	email: z
		.string({
			required_error: 'Correo electronico es requerido.',
		})
		.email({
			message: 'Correo electrónico es invalido.',
		}),

	password: z
		.string({
			required_error: 'Contraseña es requerida.',
		})
		.min(8, {
			message: 'La contraseña debe tener 8 caracteres.',
		}),
})

export const registerSchema = z.object({
	username: z
		.string({
			required_error: 'Nombre de usuario es requerido.',
		})
		.min(6, {
			message: 'Nombre de usuario debe tener 8 caracteres.',
		}),

	email: z
		.string({
			required_error: 'Correo electronico es requerido.',
		})
		.email({
			message: 'Correo electrónico es invalido.',
		}),

	password: z
		.string({
			required_error: 'Contraseña es requerida.',
		})
		.min(8, {
			message: 'La contraseña debe tener 8 caracteres.',
		}),
})
