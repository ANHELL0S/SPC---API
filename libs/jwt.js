import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export function createAccessToken(payload) {
	return new Promise((resolve, reject) => {
		jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
			if (err) reject(err)
			resolve(token)
		})
	})
}
