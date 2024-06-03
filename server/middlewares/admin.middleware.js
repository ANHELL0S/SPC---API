import { rolScheme } from '../models/postgresql/schemes.js'

export async function isAdmin(req, res, next) {
	try {
		const user = req.user
		const userRole = await rolScheme.findOne({ where: { id_user_fk: user.id } })

		if (!userRole || userRole.type_rol !== 'admin') {
			return res.status(403).json({ message: 'Only admins can perform this action.' })
		}

		next()
	} catch (error) {
		return res.status(500).json({ message: 'Error verifying user role' })
	}
}

export async function isTeacherAdmin(req, res, next) {
	try {
		const user = req.user
		const userRole = await rolScheme.findOne({ where: { id_user_fk: user.id } })

		if (!userRole || (userRole.type_rol !== 'admin' && userRole.type_rol !== 'docente')) {
			return res.status(403).json({ message: 'Only admin and teacher can perform this action.' })
		}

		next()
	} catch (error) {
		return res.status(500).json({ message: 'Error verifying user role' })
	}
}

export async function is_Teacher_General_Admin(req, res, next) {
	try {
		const user = req.user
		const userRole = await rolScheme.findOne({ where: { id_user_fk: user.id } })

		if (
			!userRole ||
			(userRole.type_rol !== 'admin' && userRole.type_rol !== 'docente' && userRole.type_rol !== 'general')
		) {
			return res.status(403).json({ message: 'Only admin or teacher or general can perform this action.' })
		}

		next()
	} catch (error) {
		return res.status(500).json({ message: 'Error verifying user role' })
	}
}
