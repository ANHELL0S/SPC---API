import { relation_tag_article_Scheme } from './postgresql/schemes.js'

export class relation_tag_article_Model {
	static async getAll() {
		try {
			const all_relations = await relation_tag_article_Scheme.findAll()
			return all_relations
		} catch (error) {
			throw new Error('Error fetching all relations parameter article: ' + error.message)
		}
	}

	static async getById({ id }) {
		try {
			const one_relation_parameter_article = await relation_tag_article_Scheme.findByPk(id)
			return one_relation_parameter_article
		} catch (error) {
			throw new Error('Error fetching relation parameter article by id: ' + error.message)
		}
	}

	static async create({ id_article_fk, id_tag_fk, description }) {
		try {
			const newArticleParameter = await relation_tag_article_Scheme.create({
				id_article_fk,
				id_tag_fk,
				description,
			})
			return newArticleParameter
		} catch (error) {
			throw new Error('Error creating article parameter: ' + error.message)
		}
	}

	static async update({ id, input }) {
		try {
			const relationTagArticle = await relation_tag_article_Scheme.findByPk(id)
			const data = await relationTagArticle.update(input)
			return data
		} catch (error) {
			throw new Error('Error updating relation parameter article: ' + error.message)
		}
	}
}
