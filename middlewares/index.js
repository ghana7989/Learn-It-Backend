/** @format */

import expressJwt from 'express-jwt'

export const protect = expressJwt({
	getToken: (req,_) => req.cookies.token,
	secret: process.env.JWT_SECRET,
	algorithms: ['HS256'],
})
