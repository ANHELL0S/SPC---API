import { z } from 'zod'
import bcrypt from 'bcrypt'
import { sendOTP } from '../libs/codeOPT.js'
import { UserModel } from '../models/users.model.js'
import { movementScheme } from '../models/postgresql/schemes.js'
import { createUsersSchema, updateUsersSchema } from '../models/validatorZod/crudUsers.schema.js'

async function getById(req, res) {
	const { id } = req.params

	try {
		const user = await UserModel.getById({ id })
		if (!user) return res.status(404).json({ Message: 'User not found' })
		res.json(user)
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function getCount(req, res) {
	try {
		const users = await UserModel.getAll()
		res.json(users.length)
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function getAll(req, res) {
	try {
		const users = await UserModel.getAll()
		res.json(users)
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function create(req, res) {
	const { body } = req

	try {
		// Parsear los datos del cuerpo de la solicitud utilizando el esquema de Zod
		const userData = createUsersSchema.parse(body)

		// Verificar si el correo electrónico ya existen
		const existingEmail = await UserModel.findUserByEmail(userData.email)
		if (existingEmail) return res.status(400).json({ message: 'El correo electrónico ya está en uso.' })

		// Verificar si el nombre de usuario ya existen
		const existingUsername = await UserModel.findUserByUsername(userData.username)
		if (existingUsername) return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' })

		// Crear el usuario si no hay conflictos
		const newUser = await UserModel.create({ input: userData })

		await movementScheme.create({
			action: `Creaste al usuario ${userData.username}`,
			targetType: 'usuarios',
			targetId: newUser.user.id_user,
			id_user_fk: req.user.id,
		})

		res.status(200).json({
			message: `Creaste al usuario ${newUser.username} existosamente.`,
		})
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(err => err.message).join('\n')
			return res.status(400).json({ message: errorMessages })
		}
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function update(req, res) {
	const { id } = req.params
	const { body } = req

	try {
		// Parsear los datos del cuerpo de la solicitud utilizando el esquema de Zod
		const userData = updateUsersSchema.parse(body)

		// Obtener el usuario antes de la actualización
		const beforeUpdate = await UserModel.getById({ id })
		if (!beforeUpdate) return res.status(404).json({ message: 'Usuario no encontrado.' })

		const { username: previousName, email: previousEmail } = beforeUpdate

		// Verificar si el nuevo username es igual al username actual y si el nuevo email es igual al email actual
		if (body.username === beforeUpdate.username && body.email === beforeUpdate.email) {
			return res.status(201).json({ message: 'Nombre de usuario y email actuales sin cambios.' })
		}

		// Verificar si el nuevo username ya está en uso por otro usuario
		const existingUsername = await UserModel.findUsername(body.username)
		if (existingUsername && existingUsername.id_user !== id)
			return res.status(400).json({ message: 'El nuevo nombre de usuario ya está en uso por otro usuario.' })

		// Verificar si el nuevo email ya está en uso por otro usuario
		const existingEmail = await UserModel.findEmail(body.email)
		if (existingEmail && existingEmail.id_user !== id)
			return res.status(400).json({ message: 'El nuevo email ya está en uso por otro usuario.' })

		// Actualizar el usuario
		const updatedUser = await UserModel.update({ id, input: userData })

		// Obtener el usuario después de la actualización
		const afterUpdate = await UserModel.getById({ id })
		const { username: currentName, email: currentEmail } = afterUpdate

		// Crear un mensaje de acción para el registro de movimiento
		let actionMessage = ''
		if (previousName !== currentName && previousEmail !== currentEmail) {
			actionMessage = `Cambiaste el nombre de usuario de ${previousName} a ${currentName} y el correo electrónico de ${previousEmail} a ${currentEmail}.`
		} else if (previousName !== currentName) {
			actionMessage = `Cambiaste el nombre de usuario de ${previousName} a ${currentName}.`
		} else if (previousEmail !== currentEmail) {
			actionMessage = `Cambiaste el correo electrónico de ${currentName} de ${previousEmail} a ${currentEmail}.`
		}

		// Crear el registro de movimiento si hay un cambio
		if (actionMessage) {
			await movementScheme.create({
				action: actionMessage,
				targetType: 'usuarios',
				targetId: id,
				id_user_fk: req.user.id,
			})
		}

		res.status(200).json({ message: `Actualizaste al usuario ${previousName} existosamente.` })
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(err => err.message).join('\n')
			return res.status(400).json({ message: errorMessages })
		}
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function updateUsername(req, res) {
	const { id } = req.params
	const { username } = req.body

	console.log({ id, username })

	try {
		// Verificar si el nombre de usuario ya está en uso
		const existingUser = await UserModel.findUserByUsername(username)
		if (existingUser) return res.status(400).json({ message: 'Username is already in use' })

		// Obtener el nombre de usuario anterior del usuario
		const beforeUpdate = await UserModel.getById({ id })
		const previousName = beforeUpdate.username

		// Actualizar el nombre de usuario
		const updatedUser = await UserModel.update({ id, input: { username } })

		// Obtener el nuevo nombre de usuario del usuario actualizado
		const afterUpdate = await UserModel.getById({ id })
		const currentName = afterUpdate.username

		if (updatedUser) {
			await movementScheme.create({
				action: `Cambiaste tu nombre de usuario de ${previousName} a ${currentName}`,
				targetType: 'usuarios',
				targetId: id,
				id_user_fk: req.user.id,
			})

			res.json(updatedUser)
		} else {
			throw res.status(404).json({ message: 'User not found' })
		}
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function updateEmail(req, res) {
	const { id } = req.params
	const { email } = req.body

	console.log('DATA ', { id, email })

	try {
		// Verificar si el correo electrónico ya está en uso
		const existingUserWithEmail = await UserModel.findUserByEmail(email)
		if (existingUserWithEmail) return res.status(400).json({ message: 'Email is already in use' })

		// Obtener el correo electrónico anterior del usuario
		const beforeUpdate = await UserModel.getById({ id })
		const previousEmail = beforeUpdate.email

		// Actualizar el correo electrónico
		const updatedUser = await UserModel.update({ id, input: { email } })

		// Obtener el nuevo correo electrónico del usuario actualizado
		const afterUpdate = await UserModel.getById({ id })
		const currentEmail = afterUpdate.email

		if (updatedUser) {
			// Enviar el código OTP al nuevo correo electrónico
			const sentcode = sendOTP(id, email) // Se debe enviar al nuevo correo electrónico
			console.log('correo viejo', email, sendOTP)

			if (!sentcode) return res.status(400).json({ message: 'Error sending code OTP' })

			await movementScheme.create({
				action: `Cambiaste tu correo electrónico de ${previousEmail} a ${currentEmail}`,
				targetType: 'usuarios',
				targetId: id,
				id_user_fk: req.user.id,
			})

			res.json(updatedUser)
		} else {
			throw res.status(404).json({ message: 'Error update email' })
		}
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function updatePassword(req, res) {
	const { id } = req.params
	const { currentPassword, newPassword, confirmPassword } = req.body

	try {
		// Obtener la contraseña cifrada del usuario desde la base de datos
		const user = await UserModel.getById({ id })

		// Verificar si se encontró el usuario
		if (!user) return res.status(404).json({ message: 'User not found' })

		// Comparar la contraseña actual proporcionada con la contraseña almacenada en la base de datos
		bcrypt.compare(currentPassword, user.password, async (err, match) => {
			if (err) {
				console.error(err)
				return res.status(500).json({ message: 'Internal server error' })
			}

			if (match) {
				if (newPassword === confirmPassword) {
					const hashedPassword = await bcrypt.hash(newPassword, 10)

					// Actualizar la contraseña en la base de datos
					await UserModel.update({ id, input: { password: hashedPassword } })

					// Crear registro de movimiento
					let actionText = ''
					if (user.role.type_rol === 'admin') {
						actionText = `Cambiaste tu contraseña`
					} else {
						actionText = `El usuario ${user.username} cambio su contraseña`
					}

					await movementScheme.create({
						action: actionText,
						targetType: 'usuarios',
						targetId: id,
						id_user_fk: req.user.id,
					})

					return res.status(200).json({ message: 'Password updated successfully' })
				} else {
					return res.status(400).json({ message: 'New passwords do not match' })
				}
			} else {
				return res.status(401).json({ message: 'Invalid current password' })
			}
		})
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function remove(req, res) {
	const { id } = req.params

	try {
		const deletedUser = await UserModel.delete({ id })
		if (!deletedUser) throw res.status(404).json({ message: 'User not found' })

		const name = await UserModel.findNameById({ id })
		await movementScheme.create({
			action: `Removiste al usuario ${name}`,
			targetType: 'usuarios',
			targetId: id,
			id_user_fk: req.user.id,
		})

		res.status(201).json({ message: `Removiste al usuario ${name} existosamente.` })
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function reactive(req, res) {
	const { id } = req.params

	try {
		await UserModel.reactive({ id })

		const name = await UserModel.findNameById({ id })
		await movementScheme.create({
			action: `Reactivaste al usuario ${name}`,
			targetType: 'usuarios',
			targetId: id,
			id_user_fk: req.user.id,
		})

		res.status(201).json({ message: `Reactivaste al usuario ${name} existosamente.` })
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

export { getById, getCount, getAll, create, update, updateUsername, updateEmail, updatePassword, remove, reactive }
