import { TagModel } from '../models/tags.model.js'
import { UserModel } from '../models/users.model.js'
import { ArticleModel } from '../models/article.model.js'
import { CategoryModel } from '../models/categories.model.js'
import { parameter_Model } from '../models/parameter.model.js'
import { articleScheme } from '../models/postgresql/schemes.js'
import { movementScheme } from '../models/postgresql/schemes.js'
import { relation_tag_article_Model } from '../models/relation_tag_article.model.js'
import { collection_article_Scheme, comments_Scheme } from '../models/postgresql/schemes.js'
import { relation_parameter_article_Model } from '../models/relation_parameter_article.model.js'
import { review_model } from '../models/review.model.js'
import { relation_tag_template_Scheme } from '../models/postgresql/schemes.js'

async function getAllArticles(req, res) {
	try {
		const articles = await ArticleModel.getAll()
		const parameterRelations = await relation_parameter_article_Model.getAll()
		const parameters = await parameter_Model.getAll()
		const relationTagArticles = await relation_tag_article_Model.getAll()
		const tags = await TagModel.getAll()

		const transformedArticles = await Promise.all(
			articles.map(async article => {
				const managerName = await UserModel.findNameById({ id: article.manager })

				const articleParameters = parameterRelations
					.filter(relation => relation.id_article_fk === article.id_article)
					.map(relation => {
						const parameter = parameters.find(param => param.id_parameter === relation.id_parameter_fk)
						return {
							id_parameter: parameter.id_parameter,
							name_parameter: parameter.name,
							description_parameter: relation.description,
						}
					})

				const articleTags = relationTagArticles
					.filter(relation => relation.id_article_fk === article.id_article)
					.map(relation => {
						const tag = tags.find(tag => tag.id_tag === relation.id_tag_fk)
						return {
							id_tag: tag.id_tag,
							name_tag: tag.name,
							description_tag: relation.description,
						}
					})

				const category = await CategoryModel.getById({ id: article.id_category_fk })
				const categoryName = category ? category.name : null

				// Get comment count for the article
				const commentCount = await comments_Scheme.count({
					where: { id_article_fk: article.id_article },
				})

				// Get collection count for the article
				const collectionCount = await collection_article_Scheme.count({
					where: { id_article_fk: article.id_article },
				})

				return {
					id_article: article.id_article,
					status: article.status,
					manager: article.manager,
					manager_name: managerName,
					id_category: article.id_category_fk,
					category_name: categoryName,
					title: article.title,
					summary: article.summary,
					link: article.link,
					parameters: articleParameters,
					tags: articleTags,
					comment_count: commentCount, // Add comment count
					collection_count: collectionCount, // Add collection count
					createdAt: article.createdAt,
					updatedAt: article.updatedAt,
				}
			})
		)

		res.json(transformedArticles)
	} catch (error) {
		console.error(error) // Log any error to the console
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error al obtener los artículos.' })
	}
}

async function getAllApprovedArticles(req, res) {
	try {
		const articles = await ArticleModel.getAll()
		const parameterRelations = await relation_parameter_article_Model.getAll()
		const parameters = await parameter_Model.getAll()
		const relationTagArticles = await relation_tag_article_Model.getAll()
		const tags = await TagModel.getAll()

		const transformedArticles = await Promise.all(
			articles.map(async article => {
				if (article.status === 'aprobado') {
					const managerName = await UserModel.findNameById({ id: article.manager })
					const articleParameters = parameterRelations
						.filter(relation => relation.id_article_fk === article.id_article)
						.map(relation => {
							const parameter = parameters.find(param => param.id_parameter === relation.id_parameter_fk)
							return {
								id_parameter: parameter.id_parameter,
								name_parameter: parameter.name,
								description_parameter: relation.description,
							}
						})

					const articleTags = relationTagArticles
						.filter(relation => relation.id_article_fk === article.id_article)
						.map(relation => {
							const tag = tags.find(tag => tag.id_tag === relation.id_tag_fk)
							return {
								id_tag: tag.id_tag,
								name_tag: tag.name,
								description_tag: relation.description,
							}
						})

					// Obtener el nombre de la categoría
					const category = await CategoryModel.getById({ id: article.id_category_fk })
					const categoryName = category ? category.name : null

					return {
						id_article: article.id_article,
						status: article.status,
						//manager_id: article.manager,
						manager_name: managerName,
						title: article.title,
						summary: article.summary,
						link: article.link,
						//id_category: article.id_category_fk,
						category_name: categoryName,
						parameters: articleParameters,
						tags: articleTags,
						createdAt: article.createdAt,
						updatedAt: article.updatedAt,
					}
				} else {
					return null
				}
			})
		)

		// Filtrar artículos nulos (no aprobados)
		const approvedArticles = transformedArticles.filter(article => article !== null)

		res.json(approvedArticles)
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error al obtener los artículos.' })
	}
}

async function getAllArticlesByUser(req, res) {
	const { id } = req.params

	try {
		const articles = await ArticleModel.findAllByUserId(id)
		const parameterRelations = await relation_parameter_article_Model.getAll()
		const parameters = await parameter_Model.getAll()
		const relationTagArticles = await relation_tag_article_Model.getAll()
		const tags = await TagModel.getAll()

		const transformedArticles = await Promise.all(
			articles.map(async article => {
				const managerName = await UserModel.findNameById({ id: article.manager })
				const articleParameters = parameterRelations
					.filter(relation => relation.id_article_fk === article.id_article)
					.map(relation => {
						const parameter = parameters.find(param => param.id_parameter === relation.id_parameter_fk)
						return {
							id_relation_parameter_article: relation.id_relation_parameter_article,
							id_parameter: parameter.id_parameter,
							name_parameter: parameter.name,
							description_parameter: relation.description,
							createdAt: relation.createdAt,
						}
					})

				const articleTags = relationTagArticles
					.filter(relation => relation.id_article_fk === article.id_article)
					.map(relation => {
						const tag = tags.find(tag => tag.id_tag === relation.id_tag_fk)
						return {
							id_relation_tag_article: relation.id_relation_tag_article,
							id_tag: tag.id_tag,
							name_tag: tag.name,
							description_tag: relation.description,
							createdAt: relation.createdAt,
						}
					})

				const category = await CategoryModel.getById({ id: article.id_category_fk })
				const categoryName = category.name

				const reviews = await review_model.getById({ id: article.id_article })
				const transformedReviews = reviews.map(review => ({
					id_review: review.id_review,
					task: review.task,
					status: review.status,
					createdAt: review.createdAt,
				}))

				return {
					id_article: article.id_article,
					status: article.status,
					manager_name: managerName,
					title: article.title,
					author: article.author,
					summary: article.summary,
					link: article.link,
					category_name: categoryName,
					parameters: articleParameters,
					tags: articleTags,
					reviews: transformedReviews,
					createdAt: article.createdAt,
					updatedAt: article.updatedAt,
				}
			})
		)

		res.json(transformedArticles)
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error al obtener los artículos del usuario.' })
	}
}

async function getArticleById(req, res) {
	const { id } = req.params // Obtiene el id del artículo de los parámetros de la solicitud

	try {
		// Obtiene todos los artículos
		const articles = await ArticleModel.getAll()

		// Obtiene todas las relaciones entre parámetros y artículos
		const parameterRelations = await relation_parameter_article_Model.getAll()

		// Obtiene todos los parámetros
		const parameters = await parameter_Model.getAll()

		// Obtiene todas las relaciones entre etiquetas y artículos
		const relationTagArticles = await relation_tag_article_Model.getAll()

		// Obtiene todas las etiquetas
		const tags = await TagModel.getAll()

		// Transforma los artículos
		const transformedArticles = await Promise.all(
			articles.map(async article => {
				if (article.id_article === id && article.status === 'aprobado') {
					// Obtiene el nombre del gerente del artículo
					const managerName = await UserModel.findNameById({ id: article.manager })

					// Obtiene los parámetros del artículo actual
					const articleParameters = parameterRelations
						.filter(relation => relation.id_article_fk === article.id_article)
						.map(relation => {
							const parameter = parameters.find(param => param.id_parameter === relation.id_parameter_fk)
							return {
								id_parameter: parameter.id_parameter,
								name_parameter: parameter.name,
								description_parameter: relation.description,
							}
						})

					// Obtiene las etiquetas del artículo actual
					const articleTags = relationTagArticles
						.filter(relation => relation.id_article_fk === article.id_article)
						.map(relation => {
							const tag = tags.find(tag => tag.id_tag === relation.id_tag_fk)
							return {
								id_tag: tag.id_tag,
								name_tag: tag.name,
								description_tag: relation.description,
							}
						})

					// Obtiene el nombre de la categoría del artículo actual
					const category = await CategoryModel.getById({ id: article.id_category_fk })
					const categoryName = category ? category.name : null

					return {
						id_article: article.id_article,
						status: article.status,
						manager_name: managerName,
						title: article.title,
						author: article.author,
						summary: article.summary,
						link: article.link,
						category_name: categoryName,
						parameters: articleParameters,
						tags: articleTags,
						createdAt: article.createdAt,
						updatedAt: article.updatedAt,
					}
				} else {
					return null // No agregar artículos no aprobados o con IDs diferentes
				}
			})
		)

		// Filtra artículos nulos (no aprobados o con IDs diferentes)
		const approvedArticle = transformedArticles.find(article => article !== null)

		if (approvedArticle) {
			res.json(approvedArticle)
		} else {
			res.status(404).json({ message: '¡El artículo no fue encontrado o no está aprobado!' })
		}
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error al obtener el artículo.' })
	}
}

async function createArticle(req, res) {
	const { body, user } = req

	try {
		const {
			id_template,
			id_category_fk,
			title,
			author,
			summary,
			link,
			id_tag_fk,
			descriptions,
			id_parameter_fk,
			descriptions_parameter,
		} = body

		// Validate required fields
		if (
			!id_template ||
			!id_category_fk ||
			!title.trim() ||
			!author.trim() ||
			!summary.trim() ||
			!link.trim() ||
			!Array.isArray(id_parameter_fk) ||
			id_parameter_fk.length === 0 ||
			!descriptions ||
			!descriptions_parameter
		) {
			return res.status(400).json({ message: 'Por favor completa todos los campos requeridos.' })
		}

		// Validate that the title does not already exist
		const existingArticle = await ArticleModel.getByTitle(title)
		if (existingArticle)
			return res.status(400).json({ message: 'El título del artículo ya existe. Por favor elija un título diferente.' })

		// Validate that all IDs in id_parameter_fk have a corresponding description
		for (const parameterId of id_parameter_fk) {
			if (!descriptions_parameter[parameterId] || descriptions_parameter[parameterId].trim() === '')
				return res.status(400).json({ message: 'Por favor completa todos los campos requeridos.' })
		}

		// Check if the template requires tags
		const templateRequiresTags =
			(await relation_tag_template_Scheme.count({ where: { id_template_fk: id_template } })) > 0

		// Validate that if the template requires tags, the IDs in id_tag_fk have corresponding descriptions
		if (templateRequiresTags) {
			if (!Array.isArray(id_tag_fk) || id_tag_fk.length === 0) {
				return res.status(400).json({ message: 'Por favor completa todos los campos requeridos.' })
			}

			for (const tagId of id_tag_fk) {
				if (!descriptions[tagId] || descriptions[tagId].trim() === '')
					return res.status(400).json({ message: 'Por favor completa todos los campos requeridos.' })
			}
		}

		// Get category data by id
		const nameCategory = await CategoryModel.findNameCategoryById({ id: id_category_fk })

		console.log(nameCategory)
		if (!nameCategory) return res.status(404).json({ message: 'Categoría no encontrada.' })

		const newArticle = await ArticleModel.create({
			id_template_fk: id_template,
			manager: user.id,
			id_category_fk,
			title,
			author,
			summary,
			link,
		})

		const idArticle = newArticle.id_article

		// Create the relationship in relation_parameter_article_Scheme
		for (const parameterId of id_parameter_fk) {
			const descriptionParameter = descriptions_parameter[parameterId]

			await relation_parameter_article_Model.create({
				id_article_fk: idArticle,
				id_parameter_fk: parameterId,
				description: descriptionParameter,
			})
		}

		// Create the relationship in relation_tag_article_Scheme if there are tags
		if (templateRequiresTags) {
			for (const tagId of id_tag_fk) {
				const descriptionTag = descriptions[tagId]

				await relation_tag_article_Model.create({
					id_article_fk: idArticle,
					id_tag_fk: tagId,
					description: descriptionTag,
				})
			}
		}

		await movementScheme.create({
			action: `El usuario ${user.username} publicó el artículo ${title} en la categoria ${nameCategory}`,
			targetType: 'articulos',
			targetId: idArticle,
			id_user_fk: user.id,
		})

		res.status(201).json({ message: 'Artículo creado exitosamente.' })
	} catch (error) {
		res.status(500).json({ message: '¡Ups! Se produjo un error al crear el artículo. Inténtalo de nuevo.' })
	}
}

async function updateArticle(req, res) {
	const { id } = req.params
	const { user, body } = req

	console.log(body)

	try {
		if (!id || !body.title || !body.summary)
			return res.status(404).json({ message: 'Por favor. Completa todos los campos.' })

		const article = await articleScheme.findByPk(id)
		if (!article) return res.status(404).json({ message: 'Artículo no encontrado.' })

		// Obtener el título actual del artículo
		const currentTitle = article.title

		// Verificar si el nuevo título ya está en uso por otro artículo, exceptuando el actual
		if (body.title !== currentTitle) {
			const titleExists = await articleScheme.findOne({ where: { title: body.title } })
			if (titleExists) return res.status(409).json({ message: 'El título ya está en uso.' })
		}

		await ArticleModel.update({ id, input: body })

		// Update parameters article
		await Promise.all(
			body.parameters.map(async parameter => {
				await relation_parameter_article_Model.update({
					id: parameter.id_relation_parameter_article,
					input: { description: parameter.description_parameter },
				})
			})
		)

		// Update tags article
		await Promise.all(
			body.tags.map(async tag => {
				await relation_tag_article_Model.update({
					id: tag.id_relation_tag_article,
					input: { description: tag.description_tag },
				})
			})
		)

		await movementScheme.create({
			action: `El usuario ${user.username} actualizo su artículo "${body.title}"`,
			targetType: 'articulos',
			targetId: id,
			id_user_fk: user.id,
		})

		res.status(200).json({ message: 'Artículo actualizado exitosamente.' })
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error al actualizar el artículo.' })
	}
}

async function deleteArticle(req, res) {
	const { id } = req.params
	try {
		const articleExists = await ArticleModel.getById({ id })
		if (!articleExists) res.status(400).json({ message: 'Artículo no encontrado.' })
		await ArticleModel.delete(id)

		res.status(201).json({ message: 'Artículo eliminado exitosamente.' })
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error al eliminar el artículo.' })
	}
}

async function check_article(req, res) {
	try {
		const { id } = req.params
		const status_actual = await ArticleModel.status_actual({ id })

		if (status_actual !== 'aprobado') {
			await articleScheme.update({ status: 'aprobado' }, { where: { id_article: id } })
			return res.status(200).json({ message: `Cambiaste el estado del articulo a aprobado.` })
		} else {
			await articleScheme.update({ status: 'pendiente' }, { where: { id_article: id } })
			return res.status(200).json({ message: `Cambiaste el estado del articulo a pendiente.` })
		}
	} catch (error) {
		return res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

export {
	getAllArticles,
	getAllApprovedArticles,
	getAllArticlesByUser,
	getArticleById,
	check_article,
	createArticle,
	updateArticle,
	deleteArticle,
}
