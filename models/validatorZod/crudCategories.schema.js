import { z } from 'zod'

const createCategoriesSchema = z.object({
	name: z
		.string({
			required_error: 'Se requiere el nombre',
		})
		.min(6, 'El nombre debe tener al menos 6 caracteres.'),

	description: z
		.string({
			required_error: 'Se requiere descripción',
		})
		.min(6, 'La descripción debe tener al menos 6 caracteres.'),
})

const updateCategoriesSchema = z.object({
	name: z
		.string({
			required_error: 'Se requiere el nombre',
		})
		.min(3, 'El nombre debe tener al menos 6 caracteres.'),

	description: z
		.string({
			required_error: 'Se requiere descripción',
		})
		.min(6, 'La descripción debe tener al menos 6 caracteres.'),
})

export { createCategoriesSchema, updateCategoriesSchema }
