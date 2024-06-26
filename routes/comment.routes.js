import { Router } from 'express'
import { Auth } from '../middlewares/auth.middleware.js'
import { getById, getAll, create, update, remove } from '../controllers/comment.controller.js'

const router = Router()

// CRUD categories - Requires authentication and administrator privileges
router.get('/', getAll)
router.get('/:id', getById)
router.post('/create/', Auth, create)
router.put('/update/:id', Auth, update)
router.delete('/remove/:id', Auth, remove)

export default router
