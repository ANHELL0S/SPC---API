import { movementScheme } from '../models/postgresql/schemes.js'
import { UserModel } from '../models/users.model.js'
import { TagModel } from '../models/tags.model.js'
import { CategoryModel } from '../models/categories.model.js'

// FIXME erro en los movements, el erroe radica en function getTargetName
async function getTargetName(targetId, targetType) {
	try {
		let targetName = ''

		if (targetType === 'usuarios') {
			const user = await UserModel.getById({ id: targetId })
			if (user) {
				targetName = user.username
			}
		} else if (targetType === 'etiquetas') {
			const tag = await TagModel.getById({ id: targetId })
			if (tag) {
				targetName = tag.name
			}
		} else if (targetType === 'categorias') {
			const category = await CategoryModel.getById({ id: targetId })
			if (category) {
				targetName = category.name
			}
		}

		return targetName
	} catch (error) {
		throw new Error('Error fetching target name: ' + error.message)
	}
}

export async function getById(req, res) {
	const { id } = req.params

	try {
		const movement = await movementScheme.findByPk(id)

		if (movement) {
			res.json(movement)
		} else {
			res.status(404).json({ message: 'Movement not found' })
		}
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Error fetching movement by id' })
	}
}

/*
export async function getAll(req, res) {
	try {
		const movements = await movementScheme.findAll()
		const usersMap = {}

		// Obtener un array de ids de usuarios únicos
		const userIds = [...new Set(movements.map(movement => movement.id_user_fk))]

		// Obtener un array de ids de objetivos únicos
		const targetIds = [...new Set(movements.map(movement => movement.targetId))]

		// Obtener los usuarios correspondientes a los ids
		for (const userId of userIds) {
			const user = await UserModel.getById({ id: userId })
			usersMap[userId] = user.username // Almacenar el nombre de usuario en el mapa
		}

		// Obtener los nombres correspondientes a los targetIds
		const targetsMap = {}

		for (const targetId of targetIds) {
			// Suponiendo que targetType esté disponible en el modelo de movimiento
			const targetType = movements.find(movement => movement.targetId === targetId)?.targetType
			const targetName = await getTargetName(targetId, targetType)
			targetsMap[targetId] = targetName
		}

		// Mapear los movimientos y añadir el nombre de usuario y el nombre del target correspondientes
		const movementsWithDetails = movements.map(movement => ({
			...movement.toJSON(),
			username: usersMap[movement.id_user_fk],
			targetName: targetsMap[movement.targetId] || null,
		}))

		res.json(movementsWithDetails)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Error fetching movements' })
	}
}
*/

export async function getAll(req, res) {
	try {
		const movements = await movementScheme.findAll()
		res.json(movements)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Error fetching movements' })
	}
}
