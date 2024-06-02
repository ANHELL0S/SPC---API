import { Router } from 'express'
import { Auth } from '../middlewares/auth.middleware.js'
import {
	getTotalCount,
	getAll,
	getById,
	create,
	update,
	reactive,
	remove,
} from '../controllers/categories.controller.js'
import { validateSchema } from '../middlewares/validatorZod.middleware.js'
import { updateCategoriesSchema } from '../models/validatorZod/crudCategories.schema.js'
import { isAdmin } from '../middlewares/admin.middleware.js'

const router = Router()

// CRUD categories - Requires authentication and administrator privileges
router.get('/count', getTotalCount)
router.get('/', getAll)
router.get('/:id', Auth, isAdmin, getById)
router.post('/create', Auth, isAdmin, create)
router.put('/update/:id', Auth, isAdmin, validateSchema(updateCategoriesSchema), update)
router.put('/reactive/:id', Auth, isAdmin, reactive)
router.delete('/remove/:id', Auth, isAdmin, remove)

export default router
