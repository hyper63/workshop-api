const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./openapi.json')
const session = require('express-session')

if (!globalThis.fetch) {
  globalThis.fetch = require('node-fetch')
}

const core = require('./middleware/core')
console.log('**********')
console.log('hyper', process.env.HYPER)
console.log('**********')

// AUTH api endpoints
const login = require('./api/auth/login')
const logout = require('./api/auth/logout')
const callback = require('./api/auth/callback')

// MOVIE api endpoints
const postMovie = require('./api/movies/index.js').post
const movie = require('./api/movies/[id]/index.js')

// REVIEWS api endpoints
const postReview = require('./api/reviews/index.js').post
const review = require('./api/reviews/[id]/index.js')

// reactions api endpoint
const reactionsByReview = require('./api/reviews/[id]/reactions.js').get

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
app.put('/api/movies/:id', movie.put)
app.get('/api/movies/:id', movie.get)
app.put('/api/movies/:id', noop)
app.delete('/api/movies/:id', noop)

// reviews
app.get('/api/movies/:id/reviews', noop)
app.get('/api/reviews', noop)
app.post('/api/reviews', postReview)
app.get('/api/reviews/:id', review.get)
app.put('/api/reviews/:id', review.put)
app.delete('/api/reviews/:id', noop)

// reactions
app.get('/api/reviews/:id/reactions', reactionsByReview)
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
