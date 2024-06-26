import { userScheme, rolScheme } from './postgresql/schemes.js'
import bcrypt from 'bcrypt'
import { Op } from 'sequelize'

export class UserModel {
	static async getAll() {
		try {
			const allUsers = await userScheme.findAll({
				include: [
					{
						model: rolScheme,
						attributes: ['type_rol'],
						where: {
							type_rol: {
								[Op.ne]: 'admin',
							},
						},
					},
				],
				order: [['updatedAt', 'DESC']],
			})
			return allUsers
		} catch (error) {
			throw new Error('Error fetching users with roles: ' + error.message)
		}
	}

	static async getById({ id }) {
		try {
			const user = await userScheme.findByPk(id, {
				include: [
					{
						model: rolScheme,
						attributes: ['type_rol'],
					},
				],
			})

			return user
		} catch (error) {
			throw new Error('Error fetching user by id: ' + error.message)
		}
	}

	static async getUserRoleType({ id }) {
		try {
			const user = await userScheme.findByPk(id, {
				include: [
					{
						model: rolScheme,
						attributes: ['type_rol'],
					},
				],
			})

			if (!user) {
				throw new Error('User not found')
			}

			return user.roles.type_rol
		} catch (error) {
			throw new Error('Error fetching user role type: ' + error.message)
		}
	}

	static async create({ input }) {
		const { username, email } = input

		try {
			// Encrypt the password
			const hashedPassword = await bcrypt.hash(email, 10)

			// Create the user
			const user = await userScheme.create({
				username,
				email,
				password: hashedPassword,
			})

			// Create and assign the role to the user
			const role = await rolScheme.create({ id_user_fk: user.id_user })

			return { user, role }
		} catch (error) {
			throw new Error('Error creating user: ' + error.message)
		}
	}

	static async register({ input }) {
		const { username, email, password } = input

		try {
			// Encrypt the password
			const hashedPassword = await bcrypt.hash(password, 10)

			// Create the user
			const user = await userScheme.create({
				username,
				email,
				password: hashedPassword,
			})

			// Create and assign the role to the user
			const role = await rolScheme.create({ id_user_fk: user.id_user, type_rol: 'general' })

			return { user, role }
		} catch (error) {
			throw new Error('Error creating user: ' + error.message)
		}
	}

	static async update({ id, input }) {
		try {
			const user = await userScheme.findByPk(id)
			await user.update(input)

			return user
		} catch (error) {
			throw new Error('Error updating user')
		}
	}

	static async delete({ id, reactivate = false }) {
		try {
			const user = await userScheme.findByPk(id)

			if (!user) {
				throw new Error('User not found')
			}

			if (reactivate) {
				user.active = true
			} else {
				user.active = false
			}

			await user.save()

			return true
		} catch (error) {
			throw new Error('Error deleting user')
		}
	}

	static async reactive({ id, reactivate = false }) {
		try {
			const user = await userScheme.findByPk(id)

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

	static async findUserByEmail(email) {
		try {
			const user = await userScheme.findOne({
				where: { email },
				include: { model: rolScheme, attributes: ['type_rol'] },
			})
			return user
		} catch (error) {
			throw new Error('Error finding user by email')
		}
	}

	static async findUserByUsername(username) {
		try {
			const user = await userScheme.findOne({ where: { username } })
			if (!user) {
				return null
			}
			return user.name
		} catch (error) {
			throw new Error('Error finding user by username')
		}
	}

	static async findUsername(username) {
		try {
			const user = await userScheme.findOne({ where: { username } })
			return user
		} catch (error) {
			throw new Error('Error finding category by name')
		}
	}

	static async findEmail(email) {
		try {
			const user = await userScheme.findOne({ where: { email } })
			return user
		} catch (error) {
			throw new Error('Error finding user by username')
		}
	}

	static async findNameById({ id }) {
		try {
			const user = await userScheme.findByPk(id)
			return user.username
		} catch (error) {
			throw new Error('Error finding user name by ID: ' + error.message)
		}
	}

	static async decryptPassword(ciphertextPassword, originalPassword) {
		try {
			const match = await bcrypt.compare(originalPassword, ciphertextPassword)
			return match
		} catch (error) {
			throw new Error('Error decrypting password: ' + error.message)
		}
	}
}
