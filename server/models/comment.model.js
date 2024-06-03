import { comments_Scheme } from './postgresql/schemes.js'

export class comment_Model {
	static async getAll() {
		try {
			const all_comment = await comments_Scheme.findAll()
			return all_comment
		} catch (error) {
			throw new Error('Error fetching comments: ' + error.message)
		}
	}

	static async getById({ id }) {
		try {
			const comment = await comments_Scheme.findByPk(id)
			return comment
		} catch (error) {
			throw new Error('Error fetching comment by id: ' + error.message)
		}
	}

	// En tu esquema de comentarios (comments_Scheme)
	static async findByArticleId({ id }) {
		try {
			const comments = await comments_Scheme.findAll({ where: { id_article_fk: id } })
			return comments
		} catch (error) {
			throw new Error('Error fetching comments by article id: ' + error.message)
		}
	}

	static async create({ comment, id_user_fk, id_article_fk }) {
		try {
			const new_comment = await comments_Scheme.create({
				comment,
				id_user_fk,
				id_article_fk,
			})
			return new_comment
		} catch (error) {
			throw new Error('Error creating comment: ' + error.message)
		}
	}

	static async update({ id, input }) {
		console.log(id, input)
		try {
			const commentToUpdate = await comments_Scheme.findByPk(id)
			await commentToUpdate.update(input)
			return commentToUpdate
		} catch (error) {
			throw new Error('Error updating comment: ' + error.message)
		}
	}

	static async delete({ id }) {
		try {
			await comments_Scheme.destroy({ where: { id_comment: id } })
			return true
		} catch (error) {
			throw new Error('Error deleting comment: ' + error.message)
		}
	}

	static async check_edited({ id }) {
		try {
			const comment = await comments_Scheme.findByPk(id)
			return comment.createdAt.getTime() !== comment.updatedAt.getTime()
		} catch (error) {
			throw new Error('Error fetching category status by id: ' + error.message)
		}
	}
}
