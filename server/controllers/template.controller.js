import { TagModel } from '../models/tags.model.js'
import { templateModel } from '../models/template.model.js'
import { CategoryModel } from '../models/categories.model.js'
import { parameter_Model } from '../models/parameter.model.js'
import { movementScheme, templateScheme, relation_tag_template_Scheme } from '../models/postgresql/schemes.js'

async function getAll(req, res) {
	try {
		const templates = await templateScheme.findAll()

		const parameterDefaults = await parameter_Model.getAll()

		const templateData = []

		for (const templateItem of templates) {
			const tagRelations = await relation_tag_template_Scheme.findAll({
				where: { id_template_fk: templateItem.id_template },
			})

			const tags = []
			for (const tagRelation of tagRelations) {
				const tag = await TagModel.getById({ id: tagRelation.id_tag_fk })

				if (tag) {
					tags.push({
						id_relation_tag_template: tagRelation.id_relation_tag_template,
						id_tag_fk: tag.id_tag,
						tag_name: tag.name,
						tag_active: tag.active,
					})
				}
			}

			if (tags) {
				const parameterDefaultsForTemplate = parameterDefaults.map(param => ({
					id_parameter: param.id_parameter,
					name_parameter: param.name,
				}))

				const categoryName = await CategoryModel.findNameCategoryById({ id: templateItem.id_category_fk })

				templateData.push({
					id_template: templateItem.id_template,
					id_category_fk: templateItem.id_category_fk,
					category_name: categoryName,
					parameter: parameterDefaultsForTemplate,
					tags: tags,
					createdAt: templateItem.createdAt,
					updatedAt: templateItem.updatedAt,
				})
			}
		}

		res.json(templateData)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function getById(req, res) {
	const { id } = req.params

	try {
		// Obtener todas las asociaciones desde el modelo templateModel
		const associations = await templateModel.getById(id)
		const associationsWithData = await Promise.all(
			associations.map(async association => {
				// Obtener información detallada de la categoría y la etiqueta asociadas
				const category = await CategoryModel.getById({ id: association.id_category_fk })
				const tag = await TagModel.getById({ id: association.id_tag_fk })

				// Verificar si la etiqueta está activa antes de incluirla en el resultado
				if (tag.active === true) {
					// Devolver los datos con información detallada de la categoría y la etiqueta
					return {
						id_category_fk: association.id_category_fk,
						categoryName: category.name,
						categoryActive: category.active,
						tags: [
							{
								id_tag_fk: association.id_tag_fk,
								tagName: tag.name,
								tagActive: tag.active,
							},
						],
					}
				} else {
					return null // Si la etiqueta no está activa, retornar null para filtrarla después
				}
			})
		)

		// Filtrar las asociaciones para eliminar las que tengan etiquetas no activas
		const filteredAssociations = associationsWithData.filter(item => item !== null)

		// Agrupar las asociaciones por categoría
		const groupedAssociations = filteredAssociations.reduce((groups, item) => {
			const group = groups.find(g => g.id_category_fk === item.id_category_fk)
			if (group) {
				group.tags.push(...item.tags)
			} else {
				groups.push(item)
			}
			return groups
		}, [])

		// Enviar el arreglo de asociaciones agrupadas como respuesta
		res.json(groupedAssociations)
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function create(req, res) {
	const { body, user } = req

	console.log('User:', user)
	console.log('Request body:', body)

	try {
		const { id_category, id_tag } = body

		// Verifica si los IDs de categoría y etiquetas están presentes en la solicitud
		if (!id_category || !id_tag || id_tag.length === 0) {
			console.log('Missing id_category or id_tag in request body')
			return res.status(400).json({ message: 'Datos vacíos en la petición.' })
		}

		// Verifica si la categoría ya está en uso
		const categoryExists = await templateScheme.findOne({ where: { id_category_fk: id_category } })
		if (categoryExists) {
			console.log('Category already exists:', id_category)
			return res.status(405).json({ message: 'Ya existe un formato para esta categoría.' })
		}

		// Crea el nuevo template
		const newTemplate = await templateScheme.create({
			id_category_fk: id_category,
			id_user_fk: user.id,
		})
		console.log('New template created:', newTemplate)

		// Itera sobre las etiquetas y crea una asociación con el template para cada una
		const associations = []
		for (const tagId of id_tag) {
			console.log('Creating association for tagId:', tagId)
			const newAssociation = await relation_tag_template_Scheme.create({
				id_template_fk: newTemplate.id_template,
				id_tag_fk: tagId,
			})
			console.log('New association created:', newAssociation)
			associations.push(newAssociation)
		}

		// Obtener los nombres de las etiquetas asociadas
		const tagNames = []
		for (const tagId of id_tag) {
			console.log('Fetching tag for id:', tagId)
			const tag = await TagModel.getById({ id: tagId })
			console.log('Tag fetched:', tag)
			if (tag) {
				tagNames.push(tag.name)
			} else {
				console.log('Tag not found for ID:', tagId)
			}
		}

		// Obtener el nombre de la categoría
		console.log('Fetching category name for id:', id_category)
		const categoryName = await CategoryModel.findNameCategoryById({ id: id_category })
		console.log('Category name fetched:', categoryName)

		// Crear registro en el movimiento
		const actionMessage = `El administrador ${user.username} creó el formato ${categoryName} con ${
			id_tag.length > 1 ? 'las etiquetas' : 'la etiqueta'
		} ${tagNames.join(', ')}`

		console.log('Creating movement with action message:', actionMessage)
		const movement = await movementScheme.create({
			action: actionMessage,
			targetType: 'formatos',
			targetId: newTemplate.id_template,
			id_user_fk: user.id,
		})
		console.log('Movement created:', movement)

		res.status(201).json({ message: `Creaste el formato ${categoryName} exitosamente.` })
	} catch (error) {
		console.error('Error in create function:', error)
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function update(req, res) {
	const { id } = req.params
	const { id_tag } = req.body

	try {
		// Verifica si id_tag es un array y si contiene al menos un elemento
		if (!Array.isArray(id_tag) || id_tag.length === 0) {
			return res.status(400).json({ message: 'La propiedad id_tag debe ser un array con al menos un elemento.' })
		}

		const associations = []
		for (const tagId of id_tag) {
			// Crea una nueva asociación en la base de datos
			const newAssociation = await relation_tag_template_Scheme.create({
				id_template_fk: id,
				id_tag_fk: tagId,
			})
			associations.push(newAssociation)
		}

		res.status(201).json({ message: `Etiqueta(s) añadida(s) al formato exitosamente.` })
	} catch (error) {
		console.error('Error al crear asociaciones:', error)
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function remove(req, res) {
	const { id } = req.params
	const { user } = req

	try {
		// Fetch the template by ID
		const associations = await templateModel.getById(id)
		if (!associations) return res.status(404).json({ message: 'Formato no encontrado.' })

		// Proceed with deletion if the template exists
		await templateModel.remove(id)

		// Uncomment to log the action in movementScheme
		const categoryName = await CategoryModel.findNameCategoryById({ id: associations[0].id_category_fk })

		await movementScheme.create({
			action: `El adminitrador ${user.username} eliminó el formato ${categoryName}`,
			targetType: 'formatos',
			targetId: id,
			id_user_fk: req.user.id,
		})

		res.status(200).json({ message: 'Removiste el formato exitosamente.' })
	} catch (error) {
		console.error('Error in remove function:', error)
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function removeTags(req, res) {
	const { id } = req.params

	try {
		// Fetch all associations for the given template ID
		const associations = await relation_tag_template_Scheme.findAll({
			where: {
				id_relation_tag_template: id,
			},
		})

		// If there are no associations, return with a 404 status
		if (!associations) {
			return res.status(404).json({ message: 'No se encontraron etiquetas asociadas.' })
		}

		await relation_tag_template_Scheme.destroy({
			where: {
				id_relation_tag_template: id,
			},
		})

		res.status(200).json({ message: 'Removiste la asociación de la etiqueta exitosamente.' })
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

export { getById, getAll, create, update, remove, removeTags }
