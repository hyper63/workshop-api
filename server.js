const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./openapi.json')
const session = require('express-session')

if (!globalThis.fetch) {
  globalThis.fetch = require('node-fetch')
}

const core = require('./middleware/core')

// api endpoints
const login = require('./api/auth/login')
const logout = require('./api/auth/logout')
const callback = require('./api/auth/callback')
const postMovie = require('./api/movies/index.js').post
const movie = require('./api/movies/[id]/index.js')



const noop = (req, res) => res.status(406).json({status: 'not implemented'})

const app = express()

app.use(cors())
app.use(express.json())
app.use(core)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}))


// movies
app.post('/api/movies', postMovie)
app.post('/api/movies/_search', noop)
app.get('/api/movies/:id', noop)
app.put('/api/movies/:id', movie.put)
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

app.use(function (err, req, res, next) {
  console.log('ERROR:', req.method, req.path, err.message)
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ok: false, message: 'not authorized'})
  }
  res.status(err.status || 500).json({ok:false, message: err.message})
})


if (!module.parent) {
  app.listen(3000)
}

module.exports = app
