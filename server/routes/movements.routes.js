import { Router } from 'express'
import { Auth } from '../middlewares/auth.middleware.js'
import { getById, getAll } from '../controllers/movements.controller.js'
import { isAdmin } from '../middlewares/admin.middleware.js'

const router = Router()

router.get('/:id', Auth, isAdmin, getById)
router.get('/', Auth, isAdmin, getAll)

export default router
