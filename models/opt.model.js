import { otpCodeScheme } from '../models/postgresql/schemes.js'

export class OTPModel {
	static async getById({ id }) {
		try {
			const otpCode = await otpCodeScheme.findByPk(id)

			if (!otpCode) {
				throw new Error('OTP code not found')
			}

			return otpCode
		} catch (error) {
			throw new Error('Error fetching OTP code by ID: ' + error.message)
		}
	}

	static async getAll() {
		try {
			const allOTPCodes = await otpCodeScheme.findAll()
			return allOTPCodes
		} catch (error) {
			throw new Error('Error fetching all OTP codes: ' + error.message)
		}
	}

	static async create({ operation_type, id_user_fk, code }) {
		try {
			const newOTPCode = await otpCodeScheme.create({
				operation_type,
				id_user_fk,
				code,
			})

			return newOTPCode
		} catch (error) {
			throw new Error('Error creating OTP code: ' + error.message)
		}
	}

	static async delete({ id }) {
		try {
			const otpCode = await otpCodeScheme.findByPk(id)

			if (!otpCode) {
				throw new Error('OTP code not found')
			}

			await otpCode.destroy()

			return true
		} catch (error) {
			throw new Error('Error deleting OTP code: ' + error.message)
		}
	}
}
