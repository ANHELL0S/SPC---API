import { tagScheme } from './postgresql/schemes.js'

export class TagModel {
	static async getAll() {
		try {
			const allTags = await tagScheme.findAll({
				order: [['updatedAt', 'DESC']],
			})
			return allTags
		} catch (error) {
			throw new Error('Error fetching tags: ' + error.message)
		}
	}

	static async getById({ id }) {
		try {
			const tag = await tagScheme.findByPk(id)
			return tag
		} catch (error) {
			throw new Error('Error fetching tag by id: ' + error.message)
		}
	}

	static async create({ input }) {
		const { name, description, id_user_fk } = input

		console.log(input)

		try {
			const newTag = await tagScheme.create({
				name,
				description,
				id_user_fk,
			})

			return newTag
		} catch (error) {
			throw new Error('Error creating tag: ' + error.message)
		}
	}

	static async update({ id, input }) {
		try {
			const tag = await tagScheme.findByPk(id)

			/*
			if (!tag?.active) {
				throw new Error('Tag not found')
			}
			*/

			await tag.update(input)

			return tag
		} catch (error) {
			throw new Error('Error updating tag: ' + error.message)
		}
	}

	static async delete({ id, reactivate = false }) {
		try {
			const tag = await tagScheme.findByPk(id)

			if (!tag) {
				throw new Error('User not found')
			}

			if (reactivate) {
				tag.active = true
			} else {
				tag.active = false
			}

			await tag.save()

			return true
		} catch (error) {
			throw new Error('Error deleting user')
		}
	}

	static async reactive({ id, reactivate = false }) {
		try {
			const user = await tagScheme.findByPk(id)

			if (!user) {
				throw new Error('User not found')
			}

			if (reactivate) {
				user.active = false
			} else {
				user.active = true
			}

			await user.save()

			return true
		} catch (error) {
			throw new Error('Error deleting user')
		}
	}

	static async findName(id) {
		try {
			const tag = await tagScheme.findByPk(id)

			if (!tag) {
				throw new Error('Tag not found')
			}

			return tag.name
		} catch (error) {
			throw new Error('Error finding tag name by ID: ' + error.message)
		}
	}

	static async findNameTag(name) {
		try {
			const tag = await tagScheme.findOne({ where: { name } })
			return tag
		} catch (error) {
			throw new Error('Error finding tag by name')
		}
	}

	static async findDescriptionTag(description) {
		try {
			const user = await tagScheme.findOne({ where: { description } })
			return user
		} catch (error) {
			throw new Error('Error finding tag by description')
		}
	}

	static async findNameTagById({ id }) {
		try {
			const tag = await tagScheme.findByPk(id)
			if (!tag) {
				return null
			}
			return tag.name
		} catch (error) {
			throw new Error('Error finding tag name by ID: ' + error.message)
		}
	}

	static async isActive({ id }) {
		try {
			const tag = await tagScheme.findByPk(id)

			if (!tag) {
				throw new Error('Tag not found')
			}
			return tag.active === true
		} catch (error) {
			throw new Error('Error fetching tag status by id: ' + error.message)
		}
	}
}
