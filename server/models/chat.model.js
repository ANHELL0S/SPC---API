import { chatScheme } from './postgresql/schemes.js'
import { Op } from 'sequelize'

export class ChatModel {
	static async getAll() {
		try {
			const allChats = await chatScheme.findAll()
			return allChats
		} catch (error) {
			throw new Error('Error fetching chats: ' + error.message)
		}
	}

	static async getById({ id }) {
		try {
			const chat = await chatScheme.findByPk(id)

			if (!chat) {
				throw new Error('Chat not found')
			}

			return chat
		} catch (error) {
			throw new Error('Error fetching chat by id: ' + error.message)
		}
	}

	static async create({ message, id_sender, id_receiver }) {
		try {
			const newChat = await chatScheme.create({
				message,
				id_sender,
				id_receiver,
			})

			return newChat
		} catch (error) {
			throw new Error('Error creating chat: ' + error.message)
		}
	}

	static async findAllBetweenUsers(senderId, receiverId) {
		try {
			if (!senderId || !receiverId) {
				throw new Error('Los IDs del remitente y del destinatario son necesarios')
			}

			const messages = await chatScheme.findAll({
				where: {
					[Op.or]: [
						{ id_sender: senderId, id_receiver: receiverId },
						{ id_sender: receiverId, id_receiver: senderId },
					],
				},
			})

			return messages
		} catch (error) {
			throw new Error('Error al buscar mensajes entre usuarios: ' + error.message)
		}
	}

	static async markAsRead({ id }) {
		try {
			const message = await chatScheme.findByPk(id)

			if (!message) {
				throw new Error('Message not found')
			}

			message.read = true
			await message.save()

			return message
		} catch (error) {
			throw new Error('Error marking message as read: ' + error.message)
		}
	}
}
