const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./openapi.json')
const session = require('express-session')

if (!globalThis.fetch) {
  globalThis.fetch = require('node-fetch')
}

const core = require('./middleware/core')
const verifyAppJWT = require('./middleware/verify-app-jwt')
const verifyScope = require('./middleware/verify-scope')

//var auth = require('./middleware/auth')

// AUTH api endpoints
// const login = require('./api/auth/login')
// const logout = require('./api/auth/logout')
// const callback = require('./api/auth/callback')

// MOVIE api endpoints
const movieReviews = require('./api/movies/[id]/reviews')
const movies = require('./api/movies')
const movie = require('./api/movies/[id]')

// REVIEWS api endpoints
const reviews = require('./api/reviews')
const review = require('./api/reviews/[id]/index.js')

// REACTIONS api endpoints
const postReaction = require('./api/reactions/index.js').post
const reactionsByReview = require('./api/reviews/[id]/reactions.js').get

const noop = (req, res) => res.status(406).json({status: 'not implemented'})

const app = express()

app.use(cors())
app.use(express.json())
app.use(core)

console.log('hello from server.js')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}))


// movies
app.post('/api/movies', verifyAppJWT, movies.post)
app.post('/api/movies/_search', movies.search)
app.put('/api/movies/:id', verifyAppJWT, movie.put)

//TODO:  TUESDAY - make sure verifyScope() works

app.get('/api/movies/:id', verifyAppJWT, verifyScope('MOVIE:DELETE'), movie.get)
app.delete('/api/movies/:id', verifyAppJWT, movie.del)
app.get('/api/movies/:id/reviews', movieReviews)
app.delete('/api/movies/searchindex/:key', verifyAppJWT, movie.deleteSearchIndex)

// reviews
app.get('/api/movies/:id/reviews', verifyAppJWT, noop)
app.get('/api/reviews', reviews.get)
app.post('/api/reviews', verifyAppJWT,reviews.post)
app.get('/api/reviews/:id', review.get)
app.put('/api/reviews/:id', verifyAppJWT, review.put)
app.delete('/api/reviews/:id', verifyAppJWT, review.del)

// reactions
app.get('/api/reviews/:id/reactions', reactionsByReview)
app.post('/api/reactions', verifyAppJWT, postReaction)

// health
app.get('/', (req, res) => res.json({name: 'movie review api'}))

app.use(function (err, req, res, next) {
  console.log('ERROR HANDLER:')
  console.log('err.name', err.name)
  //console.log('err', err)
 
  if (err.name === 'UnauthorizedError') {
    console.log('UnauthorizedError')
    console.log('err.status ',  err.status )
    return res.status(401).json({ok: false,  status: 401, message: 'Not Authorized'})
  }
  console.log('ERROR HANDLER error status', err.status, ' message ', err.message)
  res.status(err.status || 500).json({ok:false, message: err.message, status: err.status || 500})
})



if (!module.parent) {
  app.listen(3000)
}

module.exports = app
