import { ConfigModel } from '../models/configs.model.js'

export async function getAll(req, res) {
	try {
		const configs = await ConfigModel.getAll()
		res.json(configs)
	} catch (error) {
		res.status(500).json({ message: 'Error fetching config' })
	}
}

export async function update(req, res) {
	const { id } = req.params
	const { body } = req

	try {
		const updatedConfigs = await ConfigModel.update({ id, input: body })
		res.json(updatedConfigs)
	} catch (error) {
		res.status(500).json({ message: 'Error updating config' })
	}
}
