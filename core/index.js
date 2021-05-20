const movies = require('./movies')

module.exports = (services) => {
  return {
    movies: movies(services)
  }
}
