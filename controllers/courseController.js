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

export const postCourse = async (req, res) => {
	try {
		const {video} = req.files
		if (!video) throw 'No Video'
		const params = {
			Bucket: 'learn-it-bucket',
			Key: `${nanoid()}.${video.type.split('/')[1]}`, // video/mp4
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
			console.log('data: ', data)
			res.json(data)
		})
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
