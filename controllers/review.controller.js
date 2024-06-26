import { review_model } from '../models/review.model.js'

async function getAll(req, res) {
	try {
		const all_reviews = await review_model.getAll()
		return res.status(200).json(all_reviews)
	} catch (error) {
		return res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function get_pending(req, res) {
	const { id } = req.params
	try {
		const reviews = await review_model.get_pending({ id })
		if (!reviews) return res.status(404).json({ message: 'No se encontraron revisiones para este artículo.' })
		res.json(reviews)
	} catch (error) {
		return res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function get_approved(req, res) {
	const { id } = req.params
	try {
		const reviews = await review_model.get_approved({ id })
		if (!reviews) return res.status(404).json({ message: 'No se encontraron revisiones para este artículo.' })

		res.json(reviews)
	} catch (error) {
		return res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function create(req, res) {
	const { body, user } = req

	try {
		if (!body.articleId || !body.content) {
			return res.status(400).json({ message: 'El contenido de la revisión está vacío.' })
		}

		// Crear la revisión en la base de datos
		await review_model.create({
			id_article_fk: body.articleId,
			manager: user.id,
			task: body.content,
		})

		res.status(201).json({ message: 'Revisión creada exitosamente.' })
	} catch (error) {
		res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function update(req, res) {
	const { id } = req.params
	const input = req.body
	try {
		const review = await review_model.getById({ id })
		if (!review) return res.status(404).json({ message: 'Revisión no encontrada.' })
		await review_model.update({ id, input })
		res.status(200).json({ message: `Actualizaste la revisión existosamente.` })
	} catch (error) {
		return res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function check(req, res) {
	const { id } = req.params
	try {
		const review = await review_model.getById({ id })
		if (!review) return res.status(404).json({ message: 'Revisión no encontrada.' })

		await review_model.check_task({ id })
		res.status(200).json({ message: `Revisión aprobada existosamente.` })
	} catch (error) {
		console.error('Error:', error) // Agregar log para mostrar el error
		return res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function uncheck(req, res) {
	const { id } = req.params
	try {
		const review = await review_model.getById({ id })
		if (!review) return res.status(404).json({ message: 'Revisión no encontrada.' })

		await review_model.uncheck_task({ id })
		res.status(200).json({ message: `Revisión desaprobada existosamente.` })
	} catch (error) {
		console.error('Error:', error) // Agregar log para mostrar el error
		return res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

async function remove(req, res) {
	const { id } = req.params
	try {
		await review_model.remove({ id })
		res.status(200).json({ message: `Removiste la revisión existosamente.` })
	} catch (error) {
		return res.status(500).json({ message: '¡Ops! Ha ocurrido un error. Por favor, inténtalo de nuevo.' })
	}
}

export { getAll, get_pending, get_approved, create, update, check, uncheck, remove }
