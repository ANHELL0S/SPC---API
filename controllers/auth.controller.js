import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { compare } from 'bcrypt'
import { sendOTP } from '../libs/codeOPT.js'
import { createAccessToken } from '../libs/jwt.js'
import { UserModel } from '../models/users.model.js'
import { registerSchema } from '../models/validatorZod/login.scheme.js'
import { otpCodeScheme } from '../models/postgresql/schemes.js'

dotenv.config()

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email.trim() || !password.trim()) {
      return res.status(400).json({ message: 'Por favor, ingresa tus credenciales.' });
    }

    const userFound = await UserModel.findUserByEmail(email);
    const isPasswordValid = await compare(password, userFound.password);
    if (!userFound || !isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    const token = await createAccessToken({
      id: userFound.id_user,
      username: userFound.username,
      type_rol: userFound.role.type_rol,
    });

    const sentOTP = sendOTP('login', userFound.id_user, email);

    res.locals.sentOTP = sentOTP;

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      expires: new Date(Date.now() + 86400 * 1000), // Expira en 1 día
      path: '/',
    });

    res.status(200).json({ message: 'Login successful', token, user: userFound });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const register = async (req, res) => {
	const { body } = req

	try {
		registerSchema.parse(body)
	} catch (error) {
		// Si estás usando zod, los errores estarán en error.errors
		const errorMessage = error.errors.map(err => err.message).join(', ')
		console.log(errorMessage) // Esto mostrará solo el mensaje de error
		return res.status(400).json({ message: errorMessage })
	}

	try {
		const existingUsername = await UserModel.findUserByUsername(body.username)
		if (existingUsername) return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' })

		const existingEmail = await UserModel.findUserByEmail(body.email)
		if (existingEmail) return res.status(400).json({ message: 'Correo electrónico ya está en uso.' })

		const newUser = await UserModel.register({ input: body })

		return res.status(201).json({ message: 'Cuenta creada exitosamente.', newUser })

	} catch (error) {
		res.status(500).json({ message: 'Error creating user' })
	}
}

const logout = async (req, res) => {
	try {
		res.clearCookie('token', { path: '/' })
		res.status(200).json({ message: 'Closed session' })
	} catch (error) {
		res.status(500).json({ error: 'An error occurred during logout' })
	}
}

const verifyToken = async (req, res, next) => {
	const { token } = req.cookies

	if (!token) return res.status(401).json({ message: 'An access token is required.' })

	jwt.verify(token, process.env.JWT_SECRET, async (error, data) => {
		if (error) return res.status(401).json({ message: 'Invalid access token.' })

		const userFound = await UserModel.getById({ id: data.id })

		if (!userFound) return res.status(401).json({ message: 'User not found.' })

		req.userData = data
		return res.status(200).json({ message: 'Token verified successfully.', data })
	})
}

const renewToken = async (req, res) => {
	try {
		const { token } = req.body

		if (!token) {
			return res.status(400).json({ message: 'Token is required' })
		}

		jwt.verify(token, process.env.JWT_SECRET, async (error, data) => {
			if (error) {
				return res.status(401).json({ message: 'Invalid token' })
			}

			const userFound = await UserModel.getById({ id: data.id })

			if (!userFound) {
				return res.status(404).json({ message: 'User not found' })
			}

			const newToken = await createAccessToken({
				// Utiliza la función createAccessToken
				id: userFound.id_user,
				username: userFound.username,
				type_rol: userFound.role.type_rol,
			})

			res.cookie('token', newToken, {
				httpOnly: false,
				secure: false,
				path: '/',
				sameSite: 'None',
			})

			res.status(200).json({ token: newToken })
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Internal server error' })
	}
}

const updateUser = async (req, res) => {
	const { id, dataToUpdate } = req.body.data

	console.log('DATA', id, dataToUpdate)

	try {
		const user = await UserModel.getById({ id })
		if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

		const { newUsername, newEmail, newPassword, otp } = dataToUpdate

		// Buscar el código OTP en la base de datos
		const otpCode = await otpCodeScheme.findOne({
			where: {
				code: otp,
				id_user_fk: id, // Verificar que el código pertenece al usuario
			},
		})

		if (!otpCode) return res.status(400).json({ message: 'Código OTP incorrecto o no encontrado' })

		// Limpiar el código OTP después de usarlo
		//	await otpCode.destroy()

		// Actualizar los datos del usuario
		if (newEmail || newPassword) {
			if (user.otp !== otp) return res.status(400).json({ message: 'OTP incorrecto' })
			//user.otp = null // Limpiar OTP después de usarlo
		}

		const userData = {
			username: newUsername || user.username,
			email: newEmail || user.email,
			password: newPassword || user.password,
		}

		const newdatauser = await UserModel.update({ id, input: userData })

		res.status(200).json({ message: 'Usuario actualizado', user })
	} catch (error) {
		console.error('Error al actualizar usuario:', error)
		res.status(500).json({ message: 'Error interno del servidor' })
	}
}

const validateOTP = async (req, res) => {
	const { email, otp } = req.body

	try {
		// Buscar el usuario por su correo electrónico
		const user = await UserModel.findUserByEmail(email)
		if (!user) return res.status(404).json({ message: 'Email no encontrado' })

		// Buscar el registro del OTP correspondiente al usuario en la base de datos
		const otpRecord = await otpCodeScheme.findOne({
			where: { code: otp },
		})

		// Verificar si se encontró el registro del OTP en la base de datos
		if (!otpRecord) return res.status(400).json({ message: 'OTP incorrecto' })

		// Limpiar el registro del OTP después de la validación
		//	await otpRecord.destroy()

		res.status(200).json({ message: 'OTP validado correctamente' })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

const requestOTP = async (req, res) => {
	const { body } = req

	const email = body.data // Obtener el correo electrónico de los datos del cuerpo

	try {
		const user = await UserModel.findUserByEmail(email)
		if (!user) return res.status(404).json({ message: 'Email no encontrado' })

		const idUser = user.id_user

		// Enviar OTP utilizando el ID de usuario y el correo electrónico
		const sentOTP = await sendOTP('update', idUser, email)

		res.status(200).json({ message: 'OTP enviado' })
	} catch (error) {
		console.error('Error al solicitar OTP:', error.message) // Agregar un log para el error
		res.status(500).json({ message: 'Error al solicitar OTP' })
	}
}

export { login, register, logout, verifyToken, renewToken, updateUser, requestOTP, validateOTP }
