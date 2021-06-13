/** @format */
import User from '../models/userSchema.js'
import {comparePassword, hashPassword} from '../utils/auth.js'
const jwt = require('jsonwebtoken')
import AWS from 'aws-sdk'

const awsConfig = {
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
	apiVersion: process.env.AWS_API_VERSION,
}

const SES = new AWS.SES(awsConfig)

export const register = async (req, res) => {
	try {
		const {name, email, password} = req.body

		// Checking Whether Email and Name Exist
		if (!name || !email)
			return res.status(400).json('Name and Email must be provided')

		// Checking Whether Password Exist and has at least 6 characters
		if (!password || password.length < 6)
			return res
				.status(400)
				.json('Password must be provided and longer than 6 characters')

		// Checking Is there a user with the provided email
		const userExist = await User.findOne({email})
		if (userExist) return res.status(400).json('Email is already taken')

		// hashing the password before saving it to database
		const hashedPassword = await hashPassword(password)

		// Creating user and Saving
		const user = new User({
			name,
			email,
			password: hashedPassword,
		})
		await user.save()

		res.status(201).json({ok: true, email, name})
	} catch (error) {
		console.log('error: ', error)
		res.status(400).json('Error Registering User')
	}
}

export const login = async (req, res) => {
	try {
		const {email, password} = req.body
		const user = await User.findOne({email})
		if (!user) throw 'No User Found'

		// Checking Password
		const isMatch = await comparePassword(password, user.password)
		if (!isMatch) throw 'Email Or Password is wrong'

		// create a signed token
		const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
			expiresIn: '90d',
		})

		// return user and toke to client
		// Excluding password
		res.cookie('token', token, {
			httpOnly: true,
			// secure: true // Only works on HTTPS
		})
		// Send user as response
		res.status(200).json({
			email: user.email,
			name: user.name,
			id: user.id,
			picture: user.picture,
			role: user.role,
		})
	} catch (error) {
		console.log(error)
		// console.log(error.toString().split('at')[0])
		res.status(400).json(error)
	}
}

export const logout = async (req, res) => {
	try {
		res.clearCookie('token')
		res.json('Sign Out Success')
	} catch (e) {
		console.log('e: ', e)
	}
}

export const currentUser = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password')
		console.log('user: ', user)
		res.status(200).json(true)
	} catch (error) {
		console.log('error: ', error)
	}
}
export const sendTestEmail = async (req, res) => {
	const params = {
		Source: process.env.EMAIL_FROM,
		Destination: {
			ToAddresses: ['puritmp+gzjxm@gmail.com'],
		},
		ReplyToAddresses: [process.env.EMAIL_FROM],
		Message: {
			Body: {
				Html: {
					Charset: 'UTF-8',
					Data: `
            <html>
              <h1>Reset Password Link</h1>
              <p>Please use the following link to reset your password</p>
            </html>
          `,
				},
			},
			Subject: {
				Charset: 'UTF-8',
				Data: 'Password reset link',
			},
		},
	}
	const emailSent = SES.sendEmail(params).promise()
	emailSent
		.then(data => {
			console.log('data: ', data)
			res.status(200).json({ok: true})
		})
		.catch(err => {
			console.log('err: ', err)
		})
}

export const forgotPassword = async (req, res) => {
	// Basically We are using the same route but with different parameters
	// One request sends code and new password along with email
	// We execute depending upon the number of params passed
	try {
		if ([...new Set(Object.keys(req.body))].length === 3) {
			const {code, email, newPassword} = req.body
			jwt.verify(code, process.env.JWT_SECRET, (err, _) => {
				if (err) {
					throw 'Reset Code Expired'
				}
			})
			const hashedPassword = await hashPassword(newPassword)
			const user = await User.findOneAndUpdate(
				{email, passwordResetCode: code},
				{
					password: hashedPassword,
					passwordResetCode: '',
				},
			)
			res.status(200).json({ok: true})
		} else {
			const {email} = req.body
			if (!email) throw new Error('Invalid Email Provided')
			const code = jwt.sign(
				{
					email,
				},
				process.env.JWT_SECRET,
				{
					expiresIn: 600,
				},
			) // jwt sign
			const user = await User.findOneAndUpdate(
				{email},
				{passwordResetCode: code},
			)
			if (!user) throw new Error('No User Found With the provided Email')

			const params = {
				Source: process.env.EMAIL_FROM,
				Destination: {
					ToAddresses: [email],
				},
				ReplyToAddresses: [process.env.EMAIL_FROM],
				Message: {
					Body: {
						Html: {
							Charset: 'UTF-8',
							Data: `
            <html>
              <h1>Reset Password Code</h1>
              <p>Please use the following code <h3 style="color:red">${code}</h3> to reset your password</p>
            </html>
          `,
						},
					},
					Subject: {
						Charset: 'UTF-8',
						Data: 'Password reset code',
					},
				},
			}
			const emailSent = SES.sendEmail(params).promise()
			emailSent
				.then(data => {
					res.status(200).json({ok: true})
				})
				.catch(err => {
					console.log('err: ', err)
					throw new Error('Error While Sending Secret Code. Please try again')
				})
		}
	} catch (error) {
		console.log('error FROM authController Line 144: ', error)
		res.status(400).json(error)
	}
}
// To maintain streak
