import express from 'express'

const router = express.Router()

import {ifInstructor, protect} from '../middlewares'

import {uploadImage, createCourse} from '../controllers/courseController.js'

const app = express()
app.use(protect)

// Image
router.post('/course/upload-image', uploadImage)

// Course
router.post('/course', protect, ifInstructor, createCourse)

module.exports = router
