import express from 'express'
const formidableMiddleware = require('express-formidable')

const router = express.Router()

import {ifInstructor, protect} from '../middlewares'

import {
	uploadImage,
	createCourse,
	getCourse,
	postCourse,
	addLesson,
} from '../controllers/courseController.js'

const app = express()
app.use(protect)

// Image
router.post('/course/upload-image', uploadImage)

// Course
router.post('/course', protect, ifInstructor, createCourse)
router.get('/course/:slug', getCourse)
router.post(
	'/course/video-upload',
	protect,
	ifInstructor,
	formidableMiddleware(),
	postCourse,
)
router.post(
	'/course/lesson/:slug/:instructorId',
	protect,
	ifInstructor,
	addLesson,
)

module.exports = router
