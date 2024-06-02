import {
	articleScheme,
	collection_article_Scheme,
	comments_Scheme,
	relation_parameter_article_Scheme,
	relation_tag_article_Scheme,
	review_Scheme,
} from './postgresql/schemes.js'

export class ArticleModel {
	static async getAll() {
		try {
			const allArticles = await articleScheme.findAll({
				order: [['updatedAt', 'DESC']],
			})
			return allArticles
		} catch (error) {
			throw new Error('Error fetching articles: ' + error.message)
		}
	}

	static async getById({ id }) {
		try {
			const article = await articleScheme.findByPk(id)
			return article
		} catch (error) {
			throw new Error('Error fetching article by id: ' + error.message)
		}
	}

	static async findAllByUserId(id) {
		try {
			const userArticles = await articleScheme.findAll({
				where: { manager: id },
				order: [['updatedAt', 'DESC']],
			})
			return userArticles
		} catch (error) {
			throw new Error('Error fetching articles by user ID: ' + error.message)
		}
	}

	static async create({ id_template_fk, manager, id_category_fk, title, summary, link }) {
		try {
			const newArticle = await articleScheme.create({
				id_template_fk,
				manager,
				id_category_fk,
				title,
				summary,
				link,
			})
			return newArticle
		} catch (error) {
			throw new Error(error)
		}
	}

	static async update({ id, input }) {
		try {
			const article = await articleScheme.findByPk(id)
			await article.update(input)
			return article
		} catch (error) {
			throw new Error('Error updating article: ' + error.message)
		}
	}

	static async delete(id) {
		try {
			const article = await articleScheme.findByPk(id)

			// Eliminar registros relacionados en collection_article
			await collection_article_Scheme.destroy({
				where: { id_article_fk: id },
			})

			// Eliminar registros relacionados en comment
			await comments_Scheme.destroy({
				where: { id_article_fk: id },
			})

			// Eliminar registros relacionados en la relación parameter
			await relation_parameter_article_Scheme.destroy({
				where: { id_article_fk: id },
			})

			// Eliminar registros relacionados en la relación tag
			await relation_tag_article_Scheme.destroy({
				where: { id_article_fk: id },
			})

			// Eliminar registros relacionados en reviews
			await review_Scheme.destroy({
				where: { id_article_fk: id },
			})

			// Eliminar el artículo
			await article.destroy({
				where: {
					id_article: id,
				},
			})
		} catch (error) {
			throw new Error('Error finding deleting article: ' + error.message)
		}
	}

	static async findTitleById({ id }) {
		try {
			const article = await articleScheme.findByPk(id)
			return article.title
		} catch (error) {
			throw new Error('Error finding article title by ID: ' + error.message)
		}
	}

	static async status_actual({ id }) {
		try {
			const article = await articleScheme.findByPk(id)
			return article.status
		} catch (error) {
			throw new Error('Error finding article status by ID: ' + error.message)
		}
	}

	static async getByTitle(title) {
		try {
			const article = await articleScheme.findOne({
				where: { title },
			})
			return article
		} catch (error) {
			throw new Error('Error fetching article by title: ' + error.message)
		}
	}
}
