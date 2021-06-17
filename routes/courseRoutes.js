import express from 'express'

const router = express.Router()

import {ifInstructor, protect} from '../middlewares'

import {
	uploadImage,
	createCourse,
	getCourse,
} from '../controllers/courseController.js'

const app = express()
app.use(protect)

// Image
router.post('/course/upload-image', uploadImage)

// Course
router.post('/course', protect, ifInstructor, createCourse)
router.get('/course/:slug', getCourse)

module.exports = router
