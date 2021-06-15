/** @format */
import User from '../models/userSchema'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
import queryString from 'query-string'

export const makeInstructor = async (req, res) => {
	// 1 Find User From Database
	const user = await User.findById(req.user.id)
	// 2 If user does not have stripe_account_id yet then create one
	if (!user.stripe_account_id) {
		const account = await stripe.accounts.create({type: 'express'})
		user.stripe_account_id = account.id
		user.markModified('stripe_account_id')
		await user.save()
	}
	// 3 Create account link based on account id (for sending it to frontend to complete onboarding)
	let accountLink = await stripe.accountLinks.create({
		account: user.stripe_account_id,
		refresh_url: process.env.STRIPE_REDIRECT_URL,
		return_url: process.env.STRIPE_REDIRECT_URL,
		type: 'account_onboarding',
	})
	// 4 pre-fill info like email then send url response to frontend
	accountLink = {
		...accountLink,
		'stripe_user[email]': user.email,
	}
	// 5 Send the account link as response to frontend
	res
		.status(200)
		.json(`${accountLink.url}?${queryString.stringify(accountLink)}`)
}

export const getAccountStatus = async (req, res) => {
	try {
		const user = await User.findById(req.user.id)

		if (!user.stripe_account_id) throw 'No stripe account id found'
		const account = await stripe.accounts.retrieve(user.stripe_account_id)
		console.log(account)

		if (!account.charges_enabled) throw 'Charges Not Enabled'
		const statusUpdated = await User.findByIdAndUpdate(
			user.id,
			{
				stripe_seller: account,
				$addToSet: {role: 'Instructor'},
			},
			{new: true},
		).select('-password')
		res.status(200).json(statusUpdated)
	} catch (error) {
		console.log('error: ', error)
		res.status(401).json('NOT AUTHORIZED > ' + error)
	}
}

export const currentInstructor = async (req, res) => {
	try {
		let user = await User.findById(req.user.id)
		if (!user.role.includes('Instructor')) {
			res.status(403).json('Not an Instructor Account')
		} else {
			res.json({ok: true})
		}
	} catch (error) {
		console.log('error: ', error)
	}
}
