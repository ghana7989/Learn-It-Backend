/** @format */
import User from '../models/userSchema.js'
import {comparePassword, hashPassword} from '../utils/auth.js'

export const register = async (req, res) => {
	try {
		const {name, email, password} = req.body

		// Checking Whether Email and Name Exist
		if (!name || !email)
			return res.status(400).send('Name and Email must be provided')

		// Checking Whether Password Exist and has at least 6 characters
		if (!password || password.length < 6)
			return res
				.status(400)
				.send('Password must be provided and longer than 6 characters')

		// Checking Is there a user with the provided email
		const userExist = await User.findOne({email})
		if (userExist) return res.status(400).send('Email is already taken')

		// hashing the password before saving it to database
		const hashedPassword = await hashPassword(password)

		// Creating user and Saving
		const user = new User({
			name,
			email,
			password: hashedPassword,
		})
		await user.save()

		return res.status(201).json({ok: true, email, name})
	} catch (error) {
		console.log('error: ', error)
		return res.status(400).send('Error Registering User')
	}
}
