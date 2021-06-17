/** @format */
import User from '../models/userSchema'
import expressJwt from 'express-jwt'

export const protect = expressJwt({
	getToken: (req, _) => req.cookies.token,
	secret: process.env.JWT_SECRET,
	algorithms: ['HS256'],
})

export const ifInstructor = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id)
		if (!user.role.includes('Instructor')) {
			return res.statusCode(403)
		}
		next()
	} catch (e) {
		console.log(e)
	}
}
