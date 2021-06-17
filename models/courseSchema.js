import mongoose from 'mongoose'

const lessonSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			trim: true,
			minlength: 3,
			maxlength: 320,
			required: true,
		},
		slug: {
			type: String,
			unique: true,
		},
		content: {
			type: {},
			minlength: 320,
		},
		video_link: {},
		free_preview: {
			type: Boolean,
			default: false,
		},
	},
	{
		toJSON: {virtuals: true},
		toObject: {virtuals: true},
		timestamps: true,
		versionKey: false,
	},
)
lessonSchema.virtual('id').get(function () {
	return this._id.toHexString()
})

const courseSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			minlength: 3,
			maxlength: 320,
			required: true,
		},
		slug: {
			type: String,
			unique: true,
		},
		description: {
			type: {},
			minlength: 200,
			required: true,
		},
		price: {
			type: Number,
			default: 9.99,
		},
		image: {},
		category: String,
		published: {
			type: Boolean,
			default: false,
		},
		paid: {
			type: Boolean,
			default: true,
		},
		instructor: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
		lessons: [lessonSchema],
	},
	{
		toJSON: {virtuals: true},
		toObject: {virtuals: true},
		timestamps: true,
		versionKey: false,
	},
)

courseSchema.virtual('id').get(function () {
	return this._id.toHexString()
})
const Course = mongoose.model('Course', courseSchema)

export default Course
