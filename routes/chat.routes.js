import { Router } from 'express'
import { Auth } from '../middlewares/auth.middleware.js'
import { sendMessage, getMessagesBetweenUsers, markMessageAsRead } from '../controllers/chat.controller.js'
import { isTeacherAdmin } from '../middlewares/admin.middleware.js'

const router = Router()

// CRUD chat - Requires authentication

router.get('/', Auth, isTeacherAdmin, getMessagesBetweenUsers)
router.post('/sendMessage/', Auth, isTeacherAdmin, sendMessage)
router.put('/markAsRead/:id', Auth, isTeacherAdmin, markMessageAsRead)

export default router
