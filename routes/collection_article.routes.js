import { Router } from 'express'
import { Auth } from '../middlewares/auth.middleware.js'
import { getById, getAll, create, remove } from '../controllers/collection_article.controller.js'
import { is_Teacher_General_Admin } from '../middlewares/admin.middleware.js'

const router = Router()

// CRUD tags - Requires authentication
router.get('/:id', getById)
router.get('/', getAll)
router.post('/create/', Auth, is_Teacher_General_Admin, create)
router.delete('/remove/:id', Auth, is_Teacher_General_Admin, remove)

export default router
