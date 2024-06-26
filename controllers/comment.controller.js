import { comment_Model } from '../models/comment.model.js'
import { UserModel } from '../models/users.model.js'
import { movementScheme } from '../models/postgresql/schemes.js'
import { ArticleModel } from '../models/article.model.js'

async function getAll(req, res) {
	try {
		// Obtener todos los comentarios
		const all_Comments = await comment_Model.getAll()

		// Mapear y transformar cada comentario
		const commentsWithUserNames = await Promise.all(
			all_Comments.map(async comment => {
				const name_user = await UserModel.findNameById({ id: comment.id_user_fk })
				return {
					id_comment: comment.id_comment,
					id_article_fk: comment.id_article_fk,
					id_user_fk: comment.id_user_fk,
					name_user,
					comment: comment.comment,
					createdAt: comment.createdAt,
					updatedAt: comment.updatedAt,
				}
			})
		)

		res.json(commentsWithUserNames)
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function getById(req, res) {
	try {
		if (req.params.id) {
			const { id } = req.params
			const comments = await comment_Model.findByArticleId({ id })

			const commentsWithUserNames = await Promise.all(
				comments.map(async comment => {
					const name_user = await UserModel.findNameById({ id: comment.id_user_fk })

					return {
						id_comment: comment.id_comment,
						id_article_fk: comment.id_article_fk,
						id_user_fk: comment.id_user_fk,
						name_user,
						comment: comment.comment,
						createdAt: comment.createdAt,
						updatedAt: comment.updatedAt,
					}
				})
			)

			return res.json(commentsWithUserNames)
		} else {
			return res.status(400).json({ message: 'Se requiere un ID de artículo válido.' })
		}
	} catch (error) {
		return res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function create(req, res) {
	const { body, user } = req

	try {
		const { comment, id_article_fk } = req.body

		// Validar si el comentario esta vacio
		if (!comment) return res.status(400).json({ message: 'Tu comentario esta vacio.' })

		// Validar longitud del comentario
		if (comment.length > 1000 || comment.length < 6)
			return res.status(400).json({ message: 'El comentario es muy corto o muy largo.' })

		// Crear el comentario si pasa la validación
		const new_comment = await comment_Model.create({ comment, id_user_fk: user.id, id_article_fk })

		const title_article = await ArticleModel.findTitleById({ id: id_article_fk })
		console.log(title_article)

		await movementScheme.create({
			action: `El usuario ${user.username} comento el articulo "${title_article}`,
			targetType: 'comentarios',
			targetId: new_comment.id_comment,
			id_user_fk: req.user.id,
		})

		res.status(201).json({ message: `Comentario publicado exitosamente.` })
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function update(req, res) {
	try {
		const { id } = req.params
		const { body, user } = req

		const comment = await comment_Model.getById({ id })
		if (!comment) return res.status(404).json({ message: 'Comentario no encontrada.' })
		if (body.comment.length < 6) return res.status(400).json({ message: 'El comentario es demasiado corto.' })

		const updatedComment = await comment_Model.update({ id, input: body })

		const title_article = await ArticleModel.findTitleById({ id: updatedComment.id_article_fk })

		await movementScheme.create({
			action: `El usuario ${user.username} actualizó su comentario en el articulo "${title_article}"`,
			targetType: 'comentarios',
			targetId: updatedComment.id_comment,
			id_user_fk: req.user.id,
		})

		res.status(201).json({ message: `Comentario actualizado exitosamente.` })
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function remove(req, res) {
	const { id } = req.params
	const { user } = req

	console.log(id, user)

	try {
		const comment = await comment_Model.getById({ id })

		await comment_Model.delete({ id })
		const title_article = await ArticleModel.findTitleById({ id: comment.id_article_fk })

		await movementScheme.create({
			action: `El usuario ${user.username} eliminó su comentario en el artículo "${title_article}".`,
			targetType: 'comentarios',
			targetId: id,
			id_user_fk: req.user.id,
		})

		res.status(201).json({ message: `Eliminaste comentario correctamente.` })
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

export { getById, getAll, create, update, remove }
