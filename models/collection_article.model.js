import { collection_article_Scheme } from './postgresql/schemes.js'

export class collection_article_Model {
	static async getAll() {
		try {
			const all_collection_article = await collection_article_Scheme.findAll({
				order: [['updatedAt', 'DESC']],
			})
			return all_collection_article
		} catch (error) {
			throw new Error('Error fetching collections articles: ' + error.message)
		}
	}

	static async getById({ id }) {
		try {
			const collection_articles = await collection_article_Scheme.findAll({
				where: { id_user_fk: id },
			})
			return collection_articles
		} catch (error) {
			throw new Error('Error fetching collection articles by id: ' + error.message)
		}
	}

	static async create({ id_user_fk, id_article_fk }) {
		try {
			const new_collection_article = await collection_article_Scheme.create({
				id_user_fk,
				id_article_fk,
			})
			return new_collection_article
		} catch (error) {
			throw new Error('Error adding collection article: ' + error.message)
		}
	}

	static async remove({ id }) {
		try {
			const remove_collection_article = await collection_article_Scheme.findByPk(id)
			await remove_collection_article.destroy()
			return true
		} catch (error) {
			throw new Error('Error deleting collection article: ' + error.message)
		}
	}

	static async check_exists({ id_user_fk, id_article_fk }) {
		try {
			const collection_article = await collection_article_Scheme.findOne({ where: { id_user_fk, id_article_fk } })
			return collection_article !== null
		} catch (error) {
			throw new Error('Error checking collection article: ' + error.message)
		}
	}
}
