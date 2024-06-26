import { Router } from 'express'
import { Auth } from '../middlewares/auth.middleware.js'
import {
	getArticlePopular,
	getArticleById,
	getAllArticles,
	getAllApprovedArticles,
	createArticle,
	updateArticle,
	deleteArticle,
	check_article,
	getAllArticlesByUser,
} from '../controllers/article.controller.js'
import { isTeacherAdmin } from '../middlewares/admin.middleware.js'

const router = Router()

// CRUD tags - Requires authentication
router.get('/popular', getArticlePopular)
router.get('/', Auth, isTeacherAdmin, getAllArticles)
router.get('/article-public/', getAllApprovedArticles)
router.get('/:id', getArticleById)
router.get('/my-articles/:id', Auth, isTeacherAdmin, getAllArticlesByUser)
router.post('/create/', Auth, isTeacherAdmin, createArticle)
router.put('/update/:id', Auth, isTeacherAdmin, updateArticle)
router.put('/check/:id', Auth, isTeacherAdmin, check_article)
router.delete('/remove/:id', Auth, isTeacherAdmin, deleteArticle)

export default router
