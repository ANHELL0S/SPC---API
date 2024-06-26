import { parameter_global_Scheme, templateScheme } from './postgresql/schemes.js'

export class parameter_Model {
	static async getAll() {
		try {
			const allParameter = await parameter_global_Scheme.findAll({
				order: [['updatedAt', 'DESC']],
			})
			return allParameter
		} catch (error) {
			throw new Error('Error fetching categories: ' + error.message)
		}
	}

	static async getAllActive() {
		try {
			const allParameter = await parameter_global_Scheme.findAll({
				where: {
					active: true,
				},
				order: [['updatedAt', 'DESC']],
			})
			return allParameter
		} catch (error) {
			throw new Error('Error fetching categories: ' + error.message)
		}
	}

	static async getById({ id }) {
		try {
			const parameter = await parameter_global_Scheme.findByPk(id)
			return parameter
		} catch (error) {
			throw new Error('Error fetching parameter by id: ' + error.message)
		}
	}

	static async getByIdActive({ id }) {
		try {
			const category = await parameter_global_Scheme.findByPk({
				where: {
					id_category: id,
					active: true,
				},
			})

			return category
		} catch (error) {
			throw new Error('Error fetching category active by id: ' + error.message)
		}
	}

	static async create({ name, id_user_fk }) {
		try {
			const newdata = await parameter_global_Scheme.create({
				name,
				id_user_fk,
			})

			return newdata
		} catch (error) {
			throw new Error('Error creating category: ' + error.message)
		}
	}

	static async update({ id, input }) {
		try {
			const parameter = await parameter_global_Scheme.findByPk(id)
			await parameter.update(input)
			return parameter
		} catch (error) {
			throw new Error('Error updating parameter: ' + error.message)
		}
	}

	static async delete({ id }) {
		try {
			const parameter = await parameter_global_Scheme.findByPk(id)

			if (!parameter) throw new Error('Parameter not found')

			if (parameter) {
				parameter.active = true
			} else {
				parameter.active = false
			}

			await parameter.save()

			return true
		} catch (error) {
			throw new Error('Error deleting category')
		}
	}

	static async reactive({ id, reactivate = false }) {
		try {
			const category = await parameter_global_Scheme.findByPk(id)

			if (!category) {
				throw new Error('Category not found')
			}

			if (reactivate) {
				category.active = false
			} else {
				category.active = true
			}

			await category.save()

			return true
		} catch (error) {
			throw new Error('Error deleting category')
		}
	}

	static async findName(name) {
		try {
			const nameParameter = await parameter_global_Scheme.findOne({ where: { name } })
			return nameParameter
		} catch (error) {
			throw new Error('Error finding category by name')
		}
	}

	static async findDescriptionCategory(description) {
		try {
			const user = await parameter_global_Scheme.findOne({ where: { description } })
			return user
		} catch (error) {
			throw new Error('Error finding category by description')
		}
	}

	static async add({ id_category_fk, id_tag_fk }) {
		try {
			const newAssociation = await templateScheme.create({
				id_category_fk,
				id_tag_fk,
			})

			return newAssociation
		} catch (error) {
			throw new Error('Error creating category-tag association: ' + error.message)
		}
	}

	static async findNameCategoryById({ id }) {
		try {
			const category = await parameter_global_Scheme.findByPk(id)
			if (!category) {
				return null
			}
			return category.name
		} catch (error) {
			throw new Error('Error finding category name by ID: ' + error.message)
		}
	}

	static async isActive({ id }) {
		try {
			const category = await parameter_global_Scheme.findByPk(id)

			if (!category) {
				throw new Error('Category not found')
			}
			return category.active === true
		} catch (error) {
			throw new Error('Error fetching category status by id: ' + error.message)
		}
	}
}
