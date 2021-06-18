/** @format */
import {readdirSync} from 'fs'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
const morgan = require('morgan')
require('dotenv').config()

const csrfProtection = csrf({cookie: true})

const app = express()
app.use(cookieParser())
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
app.use(express.json({limit: '100mb'}))
app.use(morgan('dev'))

// route
readdirSync('./routes').map(r => app.use('/api', require(`./routes/${r}`)))

// CSRF
app.use(csrfProtection)
app.get('/api/csrf-token', (req, res) => {
	res.json({
		csrfToken: req.csrfToken(),
	})
})
// app.use(cookieParser())
// port
const port = process.env.PORT || 8000

app.listen(port, () => {
	console.log(`Server listening on ${port}`)
})
