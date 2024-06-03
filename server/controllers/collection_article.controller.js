import { collection_article_Model } from '../models/collection_article.model.js'
import { ArticleModel } from '../models/article.model.js'
import { CategoryModel } from '../models/categories.model.js'
import { UserModel } from '../models/users.model.js'
import { collection_article_Scheme } from '../models/postgresql/schemes.js'
import { movementScheme } from '../models/postgresql/schemes.js'

async function getAll(req, res) {
	try {
		const get_all_collection_article = await collection_article_Model.getAll()
		res.json(get_all_collection_article)
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function getById(req, res) {
	const { id } = req.params

	try {
		// Obtener la colección de artículos
		const collection_article = await collection_article_Model.getById({ id })

		// Array para almacenar los detalles de los artículos asociados
		const associatedArticles = []

		// Iterar sobre los artículos de la colección y buscar sus detalles y nombre de categoría
		for (const article of collection_article) {
			const idArticle = article.id_article_fk
			const articleDetails = await ArticleModel.getById({ id: idArticle })

			if (articleDetails) {
				// Verificar que articleDetails no sea null
				const managerName = await UserModel.findNameById({ id: articleDetails.manager })

				// Obtener el nombre de la categoría del artículo
				const category = await CategoryModel.getById({ id: articleDetails.id_category_fk })

				// Crear un nuevo objeto con los detalles del artículo
				const categoryName = category.name
				const articleWithCategory = {
					status: articleDetails.status,
					manager_name: managerName,
					title: articleDetails.title,
					summary: articleDetails.summary,
					link: articleDetails.link,
					category_name: categoryName,
					parameters: articleDetails.articleParameters,
					tags: articleDetails.articleTags,
					createdAt: articleDetails.createdAt,
					updatedAt: articleDetails.updatedAt,
					id_article: articleDetails.id_article,
				}

				// Agregar el artículo modificado al array
				associatedArticles.push(articleWithCategory)
			} else {
				console.warn(`Article details not found for id_article: ${idArticle}`)
			}
		}

		// Enviar la colección de artículos asociados como respuesta JSON
		console.log('Sending response:', associatedArticles)
		res.json(associatedArticles)
	} catch (error) {
		console.error('Error occurred:', error)
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function create(req, res) {
	const { body, user } = req

	try {
		const { id_article_fk } = body

		if (!user.id || !id_article_fk) return res.status(400).json({ message: 'Faltan datos requeridos.' })

		const is_exists = await collection_article_Model.check_exists({ id_user_fk: user.id, id_article_fk })
		if (is_exists) return res.status(401).json({ message: 'Ya esta en tu colleción.' })

		const article = await collection_article_Model.create({
			id_user_fk: user.id,
			id_article_fk,
		})

		const title_article = await ArticleModel.findTitleById({ id: article.id_article_fk })

		await movementScheme.create({
			action: `El usuario ${user.username} añadio el articulo "${title_article}" a su colección.`,
			targetType: 'colleciones',
			targetId: article.id_article_fk,
			id_user_fk: req.user.id,
		})

		res.status(201).json({ message: 'Añadido a tu colleción exitosamente.' })
	} catch (error) {
		res
			.status(500)
			.json({ message: '¡Ops! Ha ocurrido un error al crear los artículos. Por favor, inténtalo de nuevo.' })
	}
}

async function remove(req, res) {
	const { id } = req.params
	const { user } = req

	try {
		if (!id) return res.status(400).json({ message: 'Falta el identificador de la colección del artículo.' })

		const isExists = await collection_article_Scheme.findByPk(id)
		if (!isExists) return res.status(404).json({ message: 'El artículo no existe en tu colección.' })

		await collection_article_Scheme.destroy({ where: { id_collection_article: id } })

		const title_article = await ArticleModel.findTitleById({ id: isExists.id_article_fk })

		await movementScheme.create({
			action: `El usuario ${user.username} removió el articulo "${title_article}" de su colección.`,
			targetType: 'colleciones',
			targetId: id,
			id_user_fk: req.user.id,
		})

		res.status(200).json({ message: 'Eliminado de tu colección exitosamente.' })
	} catch (error) {
		res
			.status(500)
			.json({ message: '¡Ops! Ha ocurrido un error al eliminar el artículo. Por favor, inténtalo de nuevo.' })
	}
}

export { getById, getAll, create, remove }
