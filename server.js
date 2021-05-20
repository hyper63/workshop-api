const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./openapi.json')
const session = require('express-session')
if (!globalThis.fetch) {
  globalThis.fetch = require('node-fetch')
}

// api endpoints
const login = require('./api/auth/login')
const logout = require('./api/auth/logout')
const callback = require('./api/auth/callback')


const noop = (req, res) => res.status(406).json({status: 'not implemented'})

const app = express()

app.use(cors())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}))


// movies
app.post('/api/movies', noop)
app.post('/api/movies/_search', noop)
app.get('/api/movies/:id', noop)
app.put('/api/movies/:id', noop)
app.delete('/api/movies/:id', noop)

// reviews
app.get('/api/movies/:id/reviews', noop)
app.get('/api/reviews', noop)
app.post('/api/reviews', noop)
app.get('/api/reviews/:id', noop)
app.put('/api/reviews/:id', noop)
app.delete('/api/reviews/:id', noop)

// reactions
app.get('/api/reviews/:id/reactions', noop)
app.post('/api/reactions', noop)

// auth
app.get('/api/auth/login', login)
app.get('/api/auth/callback', callback)
app.get('/api/auth/logout', logout)

// health
app.get('/', (req, res) => res.json({name: 'movie review api'}))

if (!module.parent) {
  app.listen(3000)
}
