import { Router } from 'express'
import {
	login,
	register,
	logout,
	verifyToken,
	renewToken,
	updateUser,
	requestOTP,
	validateOTP,
} from '../controllers/auth.controller.js'

const router = Router()

router.post('/logout', logout)
router.get('/verify', verifyToken)
router.post('/renew-token', renewToken)
router.post('/login', login)
router.post('/register', register)
router.put('/update', updateUser)
router.post('/validate-otp', validateOTP)
router.post('/request-otp', requestOTP)

export default router
