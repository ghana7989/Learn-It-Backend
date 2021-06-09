/** @format */

import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
		},
		email: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			min: 6,
			max: 64,
		},
		picture: {
			type: String,
			default: '/avatar.png',
		},
		role: {
			type: [String],
			default: ['Subscriber'],
			enum: ['Subscriber', 'Instructor', 'Admin'],
		},
		stripe_account_id: '',
		stripe_seller: {},
		stripeSession: {},
	},
	{
		toJSON: {virtuals: true},
		toObject: {virtuals: true},
		timestamps: true,
		versionKey: false,
	},
)
userSchema.virtual('id').get(function () {
	return this._id.toHexString()
})
export default mongoose.model('User', userSchema)
