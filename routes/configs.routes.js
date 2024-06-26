import { Router } from 'express'
import { Auth } from '../middlewares/auth.middleware.js'
import { getAll, update } from '../controllers/configs.controller.js'
import { isAdmin } from '../middlewares/admin.middleware.js'

const router = Router()

// CRUD configs - Requires authentication and administrator privileges
router.get('/', getAll)
router.put('/update/:id', Auth, isAdmin, update)

export default router
