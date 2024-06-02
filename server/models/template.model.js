import { templateScheme, relation_tag_template_Scheme } from './postgresql/schemes.js'

export class templateModel {
	static async getAll() {
		try {
			const allAssociation = await templateScheme.findAll()
			return allAssociation
		} catch (error) {
			console.error('Error fetching all templates:', error)
			throw new Error('Error fetching template: ' + error.message)
		}
	}

	static async getById(id) {
		try {
			const templates = await templateScheme.findAll({ where: { id_template: id } })
			return templates
		} catch (error) {
			console.error('Error fetching template by ID:', error)
			throw new Error('Error fetching template by ID: ' + error.message)
		}
	}

	static async create({ id_category_fk, id_user_fk }) {
		try {
			const newAssociation = await templateScheme.create({
				id_category_fk,
				id_user_fk,
			})
			return newAssociation
		} catch (error) {
			console.error('Error creating template:', error)
			throw new Error('Error creating template: ' + error.message)
		}
	}

	static async update({ id_category_fk, id_tags_to_add, id_tags_to_remove }) {
		try {
			// Remove tags
			if (id_tags_to_remove && id_tags_to_remove.length > 0) {
				await templateScheme.destroy({
					where: {
						id_category_fk,
						id_tag_fk: id_tags_to_remove,
					},
				})
			}

			// Add new tags
			if (id_tags_to_add && id_tags_to_add.length > 0) {
				const associationsToAdd = id_tags_to_add.map(id_tag_fk => ({
					id_category_fk,
					id_tag_fk,
				}))
				await templateScheme.bulkCreate(associationsToAdd)
			}

			return true
		} catch (error) {
			console.error('Error updating template:', error)
			throw new Error('Error updating template: ' + error.message)
		}
	}

	static async checkCategory(id_category) {
		try {
			const template = await templateScheme.findOne({ where: { id_category_fk: id_category } })
			return template !== null
		} catch (error) {
			throw new Error('Error checking category: ' + error.message)
		}
	}

	static async checkTag(id) {
		try {
			const template = await relation_tag_template_Scheme.findOne({ where: { id_tag_fk: id } })
			return template !== null
		} catch (error) {
			throw new Error('Error checking tag: ' + error.message)
		}
	}

	static async remove(id) {
		console.log('recibes', id)
		try {
			// Elimina los registros relacionados en relation_tag_templates
			await relation_tag_template_Scheme.destroy({
				where: {
					id_template_fk: id,
				},
			})

			// Ahora elimina el registro de template
			await templateScheme.destroy({
				where: {
					id_template: id,
				},
			})
		} catch (error) {
			console.error(`Error eliminando el template: ${error.message}`)
		}
	}
}
