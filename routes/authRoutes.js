/** @format */

import express from 'express'
import {
	register,
	login,
	logout,
	currentUser,
} from '../controllers/authController'
import {protect} from '../middlewares'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)
router.get('/current-user', protect, currentUser)
module.exports = router
