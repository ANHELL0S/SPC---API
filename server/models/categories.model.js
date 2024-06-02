import { categoryScheme, templateScheme } from './postgresql/schemes.js'

export class CategoryModel {
	static async getTotalCount() {
		try {
			const totalCount = await categoryScheme.count()
			return totalCount
		} catch (error) {
			throw new Error('Error fetching total category count: ' + error.message)
		}
	}

	static async getAll() {
		try {
			const allCategories = await categoryScheme.findAll({
				order: [['updatedAt', 'DESC']],
			})
			return allCategories
		} catch (error) {
			throw new Error('Error fetching categories: ' + error.message)
		}
	}

	static async getAllActive() {
		try {
			const allCategories = await categoryScheme.findAll({
				where: {
					active: true,
				},
				order: [['updatedAt', 'DESC']],
			})
			return allCategories
		} catch (error) {
			throw new Error('Error fetching categories: ' + error.message)
		}
	}

	static async getById({ id }) {
		try {
			const category = await categoryScheme.findByPk(id)
			return category
		} catch (error) {
			throw new Error('Error fetching category by id: ' + error.message)
		}
	}

	static async getByIdActive({ id }) {
		try {
			const category = await categoryScheme.findByPk({
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

	static async create({ name, description, id_user_fk }) {
		try {
			const newCategory = await categoryScheme.create({
				name,
				description,
				id_user_fk,
			})
			return newCategory
		} catch (error) {
			throw new Error('Error creating category: ' + error.message)
		}
	}

	static async update({ id, input }) {
		try {
			const category = await categoryScheme.findByPk(id)
			await category.update(input)
			return category
		} catch (error) {
			throw new Error('Error updating category: ' + error.message)
		}
	}

	static async delete({ id, reactivate = false }) {
		try {
			const category = await categoryScheme.findByPk(id)
			if (reactivate) {
				category.active = true
			} else {
				category.active = false
			}
			await category.save()
			return true
		} catch (error) {
			throw new Error('Error deleting category')
		}
	}

	static async reactive({ id, reactivate = false }) {
		try {
			const category = await categoryScheme.findByPk(id)
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

	static async findNameCategory(name) {
		try {
			const category = await categoryScheme.findOne({ where: { name } })
			return category
		} catch (error) {
			throw new Error('Error finding category by name')
		}
	}

	static async findDescriptionCategory(description) {
		try {
			const user = await categoryScheme.findOne({ where: { description } })
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
			const category = await categoryScheme.findByPk(id)
			return category.name
		} catch (error) {
			throw new Error('Error finding category name by ID: ' + error.message)
		}
	}

	static async isActive({ id }) {
		try {
			const category = await categoryScheme.findByPk(id)

			if (!category) {
				throw new Error('Category not found')
			}
			return category.active === true
		} catch (error) {
			throw new Error('Error fetching category status by id: ' + error.message)
		}
	}
}
