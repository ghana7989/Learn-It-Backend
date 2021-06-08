/** @format */

import bcrypt from 'bcryptjs'

export const hashPassword = plainPassword =>
	new Promise((resolve, reject) => {
		bcrypt.genSalt(14, (err, salt) => {
			if (err) {
				reject(err)
			}
			bcrypt.hash(
				plainPassword,
				salt,
				(err, hash) => {
					if (err) {
						reject(err)
					}
					resolve(hash)
				},
			)
		})
	})

export const comparePassword = (
	plainPassword,
	hashedPassword,
) => bcrypt.compare(plainPassword, hashedPassword)
