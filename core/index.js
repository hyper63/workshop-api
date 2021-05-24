const movies = require('./movies')
const reviews = require('./reviews')
const reactions = require('./reactions')

module.exports = (services) => {
  return {
    movies: movies(services),
    reviews: reviews(services),
    reactions: reactions(services)
  }
}
