import { parameter_Model } from '../models/parameter.model.js'
import { movementScheme } from '../models/postgresql/schemes.js'
import { relation_parameter_article_Model } from '../models/relation_parameter_article.model.js'

async function getAll(req, res) {
	try {
		const articleDefaults = await parameter_Model.getAll()
		res.json(articleDefaults)
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function create(req, res) {
	const { body, user } = req

	try {
		body.id_user_fk = user.id

		const existingName = await parameter_Model.findName(body.name)
		if (existingName) return res.status(401).json({ message: 'Nombre del parametro ya en uso.' })

		const newparemeter = await parameter_Model.create(body)

		await movementScheme.create({
			action: `Creaste el parametro ${body.name}`,
			targetType: 'paremetros',
			targetId: newparemeter.id_parameter,
			id_user_fk: user.id,
		})

		res.status(201).json({ message: `Creaste el parametro ${newparemeter.name}  exitosamente.` })
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function update(req, res) {
	const { id } = req.params
	const { body } = req

	try {
		const beforeUpdate = await parameter_Model.getById({ id })
		if (!beforeUpdate) return res.status(404).json({ message: 'Paremetro no encontrado.' })

		const { name: previousName } = beforeUpdate

		if (body.name === previousName) return res.status(201).json({ message: 'Nombre actual sin cambios.' })

		// Verificar si el nuevo nombre ya está en uso por otra categoría
		if (body.name !== previousName) {
			const existingName = await parameter_Model.findName(body.name)
			if (existingName && existingName.id_articleDefault !== id)
				return res.status(401).json({ message: 'El nombre del parametro ya está en uso.' })
		}

		const updateParameter = await parameter_Model.update({ id, input: body })

		res.status(201).json({ message: `Actualizaste el parametro ${updateParameter.name}  exitosamente.` })
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function remove(req, res) {
	const { id } = req.params

	try {
		const articleDefault = await parameter_Model.getById({ id })
		if (!articleDefault) return res.status(404).json({ message: 'Parametro no encontrado.' })

		// Verificar si existen registros asociados al parametro
		const hasAssociatedRecords = await relation_parameter_article_Model.check_exists_parameter_id({ id })
		if (hasAssociatedRecords) return res.status(401).json({ message: 'Hay articulos que usan este parametro.' })

		await articleDefault.destroy()
		res.status(201).json({ message: `Eliminaste el parametro ${articleDefault.name} correctamente.` })
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

export { getAll, create, update, remove }
