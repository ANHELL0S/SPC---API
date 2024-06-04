import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'
import sequelize from './config/sequelize.js'
import tagRoutes from './routes/tags.routes.js'
import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.routes.js'
import configRoutes from './routes/configs.routes.js'
import articleRoutes from './routes/article.routes.js'
import commentsRoutes from './routes/comment.routes.js'
import templateRoutes from './routes/template.routes.js'
import categoryRoutes from './routes/categories.routes.js'
import movementsRoutes from './routes/movements.routes.js'
import parameterRoutes from './routes/parameter.routes.js'
import collectionArticleRoutes from './routes/collection_article.routes.js'
import reviewsRoutes from './routes/reviews.routes.js'

dotenv.config()

const app = express()

app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true,
	})
)
app.use(cookieParser())
app.use(express.json())

// Endpoint public - authentication
app.use('/auth', authRoutes)

// Endpoints private - authentication and authorization admin
app.use('/tags', tagRoutes)
app.use('/users', usersRoutes)
app.use('/configs', configRoutes)
app.use('/articles', articleRoutes)
app.use('/comments', commentsRoutes)
app.use('/template', templateRoutes)
app.use('/review', reviewsRoutes)
app.use('/categories', categoryRoutes)
app.use('/parameter', parameterRoutes)
app.use('/movements', movementsRoutes)
app.use('/collection-article', collectionArticleRoutes)

// Sirve los archivos estáticos del frontend desde Render
app.use(express.static('https://spc-web.onrender.com'))

// Endpoint para manejar todas las demás solicitudes y servir el archivo HTML del frontend
app.get('*', (req, res) => {
	res.sendFile('https://spc-web.onrender.com')
})

// Function to start the server
function startServer() {
	const PORT = process.env.PORT || 4000
	app.listen(PORT, () => {
		console.log(`\n>> Server running in port  -> ${PORT}`)
		console.log(`>> Connected to the db     -> ${process.env.DB_NAME}`)
		console.log(`>> CORS Origin             -> ${process.env.CORS_ORIGIN}`)
	})
}

// Connect Sequelize to the db and then start the server
sequelize
	.sync({ force: false })
	.then(() => {
		startServer()
	})
	.catch(err => {
		console.error('>> Error when synchronizing models with the database:', err)
	})
