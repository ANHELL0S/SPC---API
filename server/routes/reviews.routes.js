import { Router } from 'express'
import { Auth } from '../middlewares/auth.middleware.js'
import {
	get_approved,
	get_pending,
	getAll,
	create,
	update,
	check,
	uncheck,
	remove,
} from '../controllers/review.controller.js'
import { isTeacherAdmin } from '../middlewares/admin.middleware.js'

const router = Router()

// CRUD tags - Requires authentication
router.get('/pending/:id', get_pending)
router.get('/approved/:id', get_approved)
router.get('/', Auth, isTeacherAdmin, getAll)
router.put('/check/:id', Auth, isTeacherAdmin, check)
router.put('/uncheck/:id', Auth, isTeacherAdmin, uncheck)
router.post('/create/', Auth, isTeacherAdmin, create)
router.put('/update/:id', Auth, isTeacherAdmin, update)
router.delete('/remove/:id', Auth, isTeacherAdmin, remove)

export default router
