import { review_Scheme } from './postgresql/schemes.js'

export class review_model {
	static async getAll() {
		try {
			const all_reviews = await review_Scheme.findAll({
				order: [['updatedAt', 'DESC']],
			})
			return all_reviews
		} catch (error) {
			throw new Error('Error fetching reviews: ' + error.message)
		}
	}

	static async getById({ id }) {
		try {
			const reviews = await review_Scheme.findAll({
				where: {
					id_article_fk: id,
				},
			})
			return reviews
		} catch (error) {
			throw new Error('Error fetching pending reviews by article id: ' + error.message)
		}
	}
	static async get_approved({ id }) {
		try {
			const reviews = await review_Scheme.findAll({
				where: {
					id_article_fk: id,
					status: 'aprobado',
				},
			})
			return reviews
		} catch (error) {
			throw new Error('Error fetching pending reviews by article id: ' + error.message)
		}
	}

	static async get_pending({ id }) {
		try {
			const reviews = await review_Scheme.findAll({
				where: {
					id_article_fk: id,
					status: 'pendiente',
				},
			})
			return reviews
		} catch (error) {
			throw new Error('Error fetching pending reviews by article id: ' + error.message)
		}
	}

	static async create({ id_article_fk, manager, task }) {
		try {
			const new_review = await review_Scheme.create({
				id_article_fk,
				manager,
				task,
			})

			return new_review
		} catch (error) {
			throw new Error('Error creating review: ' + error.message)
		}
	}

	static async update({ id, input }) {
		try {
			const update_review = await review_Scheme.findByPk(id)
			await update_review.update(input)
			return update_review
		} catch (error) {
			throw new Error('Error updating review: ' + error.message)
		}
	}

	static async remove({ id }) {
		try {
			const remove_review = await review_Scheme.findByPk(id)
			await remove_review.destroy()
			return true
		} catch (error) {
			throw new Error('Error deleting review: ' + error.message)
		}
	}

	static async check_task({ id }) {
		try {
			const check_task = await review_Scheme.findByPk(id)
			await check_task.update({ status: 'aprobado' })
			return check_task
		} catch (error) {
			throw new Error('Error checking task: ' + error.message)
		}
	}

	static async uncheck_task({ id }) {
		try {
			const check_task = await review_Scheme.findByPk(id)
			await check_task.update({ status: 'pendiente' })
			return check_task
		} catch (error) {
			throw new Error('Error checking task: ' + error.message)
		}
	}
}
