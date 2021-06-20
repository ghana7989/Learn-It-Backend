import {readFileSync} from 'fs'
import AWS from 'aws-sdk'
import {nanoid} from 'nanoid'
import Course from '../models/courseSchema'
import {awsConfig} from './authController'
import slugify from 'slugify'

const S3 = new AWS.S3(awsConfig)

export const uploadImage = async (req, res) => {
	try {
		const {image} = req.body
		if (!image) throw 'No Image'

		// Prepare the image
		const base64Data = new Buffer.from(
			image.replace(/^data:image\/\w+;base64,/, ''),
			'base64',
		)
		const type = image.split(';')[0].split('/')[1]
		const params = {
			Bucket: 'learn-it-bucket',
			Key: `${nanoid()}.${type}`,
			Body: base64Data,
			ACL: 'public-read',
			ContentEncoding: 'base64',
			ContentType: `image/${type}`,
		}
		// Upload to S3
		S3.upload(params, (err, data) => {
			if (err) {
				throw 'Upload To Database Failed'
			}
			console.log(data)
			return res.send(data)
		})
	} catch (error) {
		console.log('error: ', error)
		res.status(400).json(error)
	}
}

export const createCourse = async (req, res) => {
	console.log(req.body)
	try {
		const isCourse = await Course.findOne({
			slug: slugify(req.body.name.toLowerCase()),
		})
		if (isCourse) throw 'Course with this name already exists'

		const course = await new Course({
			slug: slugify(req.body.name),
			instructor: req.user.id,
			...req.body,
		})
		course.save()
		res.status(200).json('success')
	} catch (error) {
		console.log(error)
		res.status(400).json(error)
	}
}

export const getCourse = async (req, res) => {
	console.log('req.params.slug: ', req.params.slug)
	try {
		const course = await Course.findOne({slug: req.params.slug}).populate(
			'instructor',
		)
		if (!course) throw 'No Such Course Exists'
		res.status(200).json(course)
	} catch (error) {
		console.log('error: ', error)
		res.status(400).json(error)
	}
}

export const addLesson = async (req, res) => {
	try {
		const {slug, instructorId} = req.params
		if (req.user.id !== instructorId) throw 'Not Authorized'
		console.log('req.body: ', req.body)
		const {title, description, video} = req.body
		console.log('video: ', video)
		const updatedCourse = await Course.findOneAndUpdate(
			{slug},
			{
				$push: {
					lessons: {
						title,
						description,
						video,
						slug: slugify(title),
					},
				},
			},
			{new: true},
		).populate('instructor')
		res.json(updatedCourse)
	} catch (error) {
		console.log('error: ', error)
		res.status(400).json(error)
	}
}

export const updateCourse = async (req, res) => {
	const {slug} = req.params
	const course = await Course.findOne({slug}).populate('instructor')
	{
		// Checking if the instructor is is the owner of the course
		if (req.user.id !== course.instructor.id)
			return res.status(400).json('Not Authorized')
	}
	const updatedCourse = await Course.findOneAndUpdate({slug}, req.body, {
		new: true,
	})
	res.status(200).json(updatedCourse)
}

export const removeLesson = async (req, res) => {
	try {
		const {slug, lessonId} = req.params
		const course = await Course.findOne({slug}).populate('instructor')
		if (req.user.id !== course.instructor.id) throw 'Not Authorized'
		const temp = await Course.findByIdAndUpdate(
			course.id,
			{
				$pull: {lessons: {_id: lessonId}},
			},
			{new: true},
		)
		console.log('temp: ', temp)
		res.sendStatus(200)
	} catch (error) {
		console.log('error: ', error)
		res.status(400).json(error)
	}
}
export const uploadVideo = async (req, res) => {
	try {
		const {video} = req.files
		if (!video) throw 'No Video'
		const params = {
			Bucket: 'learn-it-bucket',
			Key: `video-+${nanoid()}.${video.type.split('/')[1]}`, // video/mp4
			Body: readFileSync(video.path),
			ACL: 'public-read',
			ContentType: video.type,
		}
		// upload to S3
		S3.upload(params, (err, data) => {
			if (err) {
				console.log('err: ', err)
				req.sendStatus(400)
			}
			res.status(200).json(data)
		})
	} catch (error) {
		console.log('error: ', error)
		res.status(400).json(error)
	}
}

export const removeVideo = async (req, res) => {
	try {
		const {Bucket, Key} = req.body
		S3.deleteObject({Bucket, Key}, (err, data) => {
			if (err) {
				console.log(err)
				res.sendStatus(400)
			}

			res.status(200).json({ok: true})
		})
	} catch (error) {
		console.log('error: ', error)
		res.status(400).json(error)
	}
}

export const updateLesson = async (req, res) => {
	try {
		const {courseId, lessonId} = req.params
		const {title, description, video, free_preview} = req.body
		const courseFound = await Course.findById(courseId).populate('instructor')
		if (req.user.id !== courseFound.instructor.id) {
			throw 'Not Authorized To UpdateLesson'
		}
		const updated = await Course.updateOne(
			{'lessons._id': lessonId},
			{
				$set: {
					'lessons.$.title': title,
					'lessons.$.description': description,
					'lessons.$.video': video,
					'lessons.$.free_preview': free_preview,
				},
			},
		)
		res.json({ok: true})
	} catch (error) {
		console.log('error: ', error)
		res.status(400).json(error)
	}
}
