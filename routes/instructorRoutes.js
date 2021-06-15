/** @format */

import express from 'express'
import {
	makeInstructor,
	getAccountStatus,
	currentInstructor,
} from '../controllers/instructorController'
import {protect} from '../middlewares'

const router = express.Router()

router.post('/make-instructor', protect, makeInstructor)
router.get('/get-account-status', protect, getAccountStatus)
router.get('/current-instructor', protect, currentInstructor)
module.exports = router
