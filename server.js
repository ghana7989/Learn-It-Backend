/** @format */
import {readdirSync} from 'fs'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
const morgan = require('morgan')
require('dotenv').config()

const app = express()

// DB connection
mongoose
	.connect(process.env.DB_URI, {
		useNewUrlParser: true,
		useFindAndModify: false,
		useCreateIndex: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('DB Connection Successful')
	})
	.catch(e => console.log(`DB Error -> ${e}`))

// Middlewares
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// route
readdirSync('./routes').map(r =>
	app.use('/api', require(`./routes/${r}`)),
)

// port
const port = process.env.PORT || 8000

app.listen(port, () => {
	console.log(`Server listening on ${port}`)
})
