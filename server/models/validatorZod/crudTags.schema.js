import { z } from 'zod'

export const createTagsSchema = z.object({
	name: z
		.string({
			required_error: 'Name is required',
		})
		.min(3, 'Name must have at least 3 characters'),

	description: z
		.string({
			required_error: 'Description is required',
		})
		.min(6, 'Description must have at least 6 characters'),
})

export const updateTagsSchema = z.object({
	name: z
		.string({
			required_error: 'Name is required',
		})
		.min(3, 'Name must have at least 3 characters'),

	description: z
		.string({
			required_error: 'Description is required',
		})
		.min(6, 'Description must have at least 6 characters'),
})
