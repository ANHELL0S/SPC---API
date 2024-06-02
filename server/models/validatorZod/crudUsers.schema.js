import { z } from 'zod'

const createUsersSchema = z.object({
	username: z
		.string({
			required_error: 'Se requiere nombre de usuario',
		})
		.min(3, 'El nombre debe tener al menos 3 caracteres.'),

	email: z
		.string({
			required_error: 'Correo electrónico es requerido.',
		})
		.email({
			message: 'Correo electrónico inválido.',
		})
		.refine(value => value.endsWith('gmail.com'), {
			message: 'El correo electrónico debe ser de Gmail.',
		}),
})

const updateUsersSchema = z.object({
	username: z
		.string({
			required_error: 'Se requiere nombre de usuario',
		})
		.min(3, 'El nombre debe tener al menos 3 caracteres.'),

	email: z
		.string({
			required_error: 'Correo electrónico es requerido.',
		})
		.email({
			message: 'Correo electrónico inválido.',
		})
		.refine(value => value.endsWith('gmail.com'), {
			message: 'El correo electrónico debe ser de Gmail.',
		}),
})

export { createUsersSchema, updateUsersSchema }
