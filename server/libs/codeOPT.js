import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { OTPModel } from '../models/opt.model.js'

dotenv.config()

const transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD,
	},
})

const sendOTP = async (operationType, id, email) => {
	const otp = Math.floor(1000 + Math.random() * 9000)

	const mailOptions = {
		from: process.env.EMAIL_USERNAME,
		to: email,
		subject: 'Código OTP para acceso',
		text: `Tu código OTP es: ${otp}`,
	}

	const expires = new Date()
	expires.setMinutes(expires.getMinutes() + 10)
	mailOptions.expires = expires

	transporter.sendMail(mailOptions, async (error, info) => {
		if (error) {
			console.log('Error al enviar correo:', error)
		} else {
			console.log('Correo enviado:', info.response)
			console.log('Código OTP:', otp)
			console.log('Válido hasta:', expires)

			console.log('data del codeopt', operationType, id, otp)
			try {
				await OTPModel.create({ operation_type: operationType, id_user_fk: id, code: otp })
			} catch (err) {
				console.error('Error al almacenar el código OTP en la base de datos:', err)
			}
		}
	})
}

export { sendOTP }
