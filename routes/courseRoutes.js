import express from 'express'
const formidableMiddleware = require('express-formidable')

const router = express.Router()

import {ifInstructor, protect} from '../middlewares'

import {
	uploadImage,
	createCourse,
	getCourse,
	uploadVideo,
	addLesson,
	updateCourse,
	removeLesson,
	removeVideo,
	updateLesson,
} from '../controllers/courseController.js'

const app = express()
app.use(protect)

// Image
router.post('/course/upload-image', uploadImage)

// Course
router.post('/course', protect, ifInstructor, createCourse)
router.put('/course/:slug', protect, ifInstructor, updateCourse)
router.get('/course/:slug', getCourse)
router.post(
	'/course/video-upload',
	protect,
	ifInstructor,
	formidableMiddleware(),
	uploadVideo,
)
router.post('/course/remove-video', protect, ifInstructor, removeVideo)
router.post(
	'/course/lesson/:slug/:instructorId',
	protect,
	ifInstructor,
	addLesson,
)
// update
router.put(
	'/course/lesson/:courseId/:lessonId',
	protect,
	ifInstructor,
	updateLesson,
)
router.put('/course/:slug/:lessonId', protect, ifInstructor, removeLesson)

module.exports = router
