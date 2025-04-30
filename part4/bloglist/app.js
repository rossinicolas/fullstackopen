const config = require('./utils/config')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan') // Importar morgan
const app = express()
const blogsRouter = require('./controllers/blogs')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

mongoose.set('strictQuery', false)

const { MONGODB_URI } = config
logger.info('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())

// Configurar morgan para registrar solicitudes HTTP
app.use(morgan('tiny'))

app.use(middleware.requestLogger)
app.use('/api/blogs', blogsRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app