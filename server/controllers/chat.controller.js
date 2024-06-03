import { ChatModel } from '../models/chat.model.js'
import { UserModel } from '../models/users.model.js'

export async function sendMessage(req, res) {
	try {
		const { message, senderId, receiverId } = req.body

		// Verificar si el remitente y el destinatario existen
		const sender = await UserModel.getById({ id: senderId })
		const receiver = await UserModel.getById({ id: receiverId })

		if (!sender || !receiver) {
			return res.status(404).json({ error: 'El remitente o el destinatario no existen' })
		}

		// Crear un nuevo mensaje en la base de datos
		const newMessage = await ChatModel.create({
			message,
			id_sender: senderId,
			id_receiver: receiverId,
		})

		res.status(201).json({ message: 'Mensaje enviado correctamente', data: newMessage })
	} catch (error) {
		console.error('Error al enviar el mensaje:', error)
		res.status(500).json({ error: 'Error interno del servidor' })
	}
}

export async function getMessagesBetweenUsers(req, res) {
	try {
		const { senderId, receiverId } = req.params // Obtener los IDs del remitente y del destinatario de los parámetros de la URL

		// Verificar si los IDs del remitente y del destinatario están presentes
		if (!senderId || !receiverId) {
			console.error('IDs del remitente y del destinatario no están presentes en la solicitud')
			return res.status(400).json({ error: 'Los IDs del remitente y del destinatario son necesarios' })
		}

		// Realizar la consulta para obtener los mensajes entre los usuarios
		console.log(`Obteniendo mensajes entre ${senderId} y ${receiverId}`)
		const messages = await ChatModel.findAllBetweenUsers(senderId, receiverId)

		// Enviar los mensajes como respuesta
		res.status(200).json({ data: messages })
	} catch (error) {
		// Capturar cualquier error y enviar una respuesta de error al cliente
		console.error('Error al obtener los mensajes:', error)
		res.status(500).json({ error: 'Error interno del servidor' })
	}
}

export async function markMessageAsRead(req, res) {
	try {
		const { messageId } = req.params

		// Marcar el mensaje como leído
		await ChatModel.markAsRead(messageId)

		res.status(200).json({ message: 'Mensaje marcado como leído correctamente' })
	} catch (error) {
		console.error('Error al marcar el mensaje como leído:', error)
		res.status(500).json({ error: 'Error interno del servidor' })
	}
}
