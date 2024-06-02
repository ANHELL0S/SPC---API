import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

export const Auth = (req, res, next) => {
	try {
		const { token } = req.cookies

		if (!token) return res.status(401).json({ message: 'Inicia sesión primero.' })

		jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
			if (error) return res.status(401).json({ message: 'Token de acceso no válido.' })
			req.user = user
			next()
		})
	} catch (error) {
		return res.status(500).json({ message: error.message })
	}
}
