import { z } from 'zod'
import { TagModel } from '../models/tags.model.js'
import { movementScheme } from '../models/postgresql/schemes.js'
import { templateModel } from '../models/template.model.js'
import { createTagsSchema, updateTagsSchema } from '../models/validatorZod/crudTags.schema.js'

async function getById(req, res) {
	const { id } = req.params

	try {
		const tag = await TagModel.getById({ id })

		if (tag) {
			res.json(tag)
		} else {
			res.status(404).json({ message: 'Tag not found' })
		}
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Error fetching tag by id' })
	}
}

async function getAll(req, res) {
	try {
		const tags = await TagModel.getAll()
		res.json(tags)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Error fetching tag' })
	}
}

async function create(req, res) {
	const { body, user } = req

	try {
		// Parsear los datos del cuerpo de la solicitud utilizando el esquema de Zod
		const zodData = createTagsSchema.parse(body)

		zodData.id_user_fk = user.id // Incluir la ID de usuario que crea

		const existingName = await TagModel.findNameTag(zodData.name)
		if (existingName) return res.status(400).json({ message: 'Nombre de la etiqueta ya en uso.' })

		// Crear el tag si no hay conflictos
		const newTag = await TagModel.create({ input: zodData })

		// Crear un log con el CRUD
		await movementScheme.create({
			action: `Creaste la etiqueta ${zodData.name}`,
			targetType: 'etiquetas',
			targetId: newTag.id_tag,
			id_user_fk: user.id,
		})

		res.status(201).json({ message: `Creaste la etiqueta ${newTag.name} exitosamente.` })
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(err => err.message).join('\n')
			return res.status(400).json({ message: errorMessages })
		}

		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function update(req, res) {
	const { id } = req.params
	const { body, user } = req

	try {
		// Validar los datos del cuerpo de la solicitud utilizando el esquema de Zod
		const validatedData = updateTagsSchema.parse(body)

		// Obtener el nombre anterior y la descripción de la etiqueta
		const beforeUpdate = await TagModel.getById({ id })
		const previousName = beforeUpdate.name
		const previousDescription = beforeUpdate.description

		// Verificar si el nuevo nombre es igual al nombre actual y si la nueva descripción es igual a la descripción actual
		if (validatedData.name === previousName && validatedData.description === previousDescription) {
			return res.status(201).json({ message: 'Nombre y descripción actuales sin cambios.' })
		}

		// Verificar si el nuevo nombre ya está en uso por otra etiqueta
		if (validatedData.name !== previousName) {
			const existingTag = await TagModel.findNameTag(validatedData.name)
			if (existingTag && existingTag.id !== id) {
				return res.status(400).json({ message: 'El nombre ya está en uso por otra etiqueta.' })
			}
		}

		// Actualizar la etiqueta, independientemente de si los campos han cambiado
		const updatedTag = await TagModel.update({ id, input: validatedData })
		if (!updatedTag) return res.status(404).json({ message: 'Etiqueta no encontrada.' })

		// Obtener el nuevo nombre y descripción de la etiqueta
		const currentName = updatedTag.name
		const currentDescription = updatedTag.description

		// Construir el mensaje de acción para el registro de movimiento
		let actionMessage = ''
		if (previousName !== currentName) {
			actionMessage += `Cambiaste el nombre de la etiqueta ${previousName} a ${currentName}. `
		}
		if (previousDescription !== currentDescription) {
			actionMessage += `Cambiaste la descripción de la etiqueta ${currentName} de ${previousDescription} a ${currentDescription}. `
		}

		// Crear el registro de movimiento si hay un cambio en el nombre o descripción
		if (actionMessage) {
			await movementScheme.create({
				action: actionMessage.trim(),
				targetType: 'etiquetas',
				targetId: id,
				id_user_fk: user.id,
			})
		}

		res.status(200).json({ message: `Actualizaste la etiqueta ${previousName} exitosamente.` })
	} catch (error) {
		console.error('Error en la actualización de la etiqueta:', error)
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function remove(req, res) {
	const { id } = req.params

	try {
		const isTagInUse = await templateModel.checkTag(id)
		if (isTagInUse) return res.status(401).json({ message: 'Etiqueta en uso en un formato.' })

		const tagDeleted = await TagModel.delete({ id })
		if (!tagDeleted) res.status(404).json({ message: 'Etiqueta no econtrada.' })

		const name = await TagModel.findNameTagById({ id })
		await movementScheme.create({
			action: `Removiste la etiqueta ${name}`,
			targetType: 'etiquetas',
			targetId: id,
			id_user_fk: req.user.id,
		})

		res.status(200).json({ message: `Removiste la etiqueta ${name} existosamente.` })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Error deleting tag' })
	}
}

async function reactive(req, res) {
	const { id } = req.params

	try {
		const reactiveTag = await TagModel.reactive({ id })
		if (!reactiveTag) res.status(404).json({ message: 'Etiqueta no encontrada.' })

		const tagName = await TagModel.findNameTagById({ id })
		await movementScheme.create({
			action: `Reactivaste la etiqueta ${tagName}`,
			targetType: 'etiquetas',
			targetId: id,
			id_user_fk: req.user.id,
		})

		res.status(200).json({ message: `Ractivaste la etiqueta ${tagName} existosamente.` })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Error updating tag' })
	}
}

export { getById, getAll, create, update, remove, reactive }
