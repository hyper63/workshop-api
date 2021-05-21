const movies = require('./movies')
const reviews = require('./reviews')
module.exports = (services) => {
  return {
    movies: movies(services),
    reviews: reviews(services)
  }
}
