import { Router } from 'express'
import { Auth } from '../middlewares/auth.middleware.js'
import { getAll, getById, create, update, remove, removeTags } from '../controllers/template.controller.js'
import { isAdmin, isTeacherAdmin } from '../middlewares/admin.middleware.js'

const router = Router()

// CRUD template - Requires authentication and administrator privileges
router.get('/', Auth, isTeacherAdmin, getAll)
router.get('/:id', Auth, isTeacherAdmin, getById)
router.post('/create/', Auth, isAdmin, create)
router.delete('/remove/:id', Auth, isAdmin, remove)
router.put('/update/:id', Auth, isAdmin, update)
router.delete('/removeTags/:id', Auth, isAdmin, removeTags)

export default router
