const { validate, validateCriteria } = require('./schema')
const verify = require('../lib/verify')
const { assoc } = require('ramda')
const { Async } = require('crocks')
const cuid = require('cuid')

module.exports = (services) => {
  function post(movie) {
    return Async.of(movie) 
      .map(createId)
      .chain(validate)
      .map(assoc('type', 'movie'))
      .chain(services.data.create)
      .chain(verify)
  }

  function put(id, movie) {
    return Async.of(movie)
      .map(assoc('id', id))
      .chain(validate)
      .map(assoc('type', 'movie'))
      .chain(movie => services.data.update(id, movie))
      .chain(verify)
  }

  function get(id) {
    return services.data.get(id).map(schema.parse)
  }

  function search(criteria) {
    return Async.of(criteria)
      .chain(validateCriteria)
      .map(criteria => {
        const query = [criteria.title, criteria.year, criteria.genre].join(' ')

        return {
          query,
          filter: { type: 'movie'}
        }
      })
      .chain(doc => 
        services.search.query(
            doc.query, 
            ['title', 'year', 'genre'], 
            doc.filter
        )
      )
      .chain(verify)

  }

  return {
    post,
    put,
    get,
    search
  }
}


function createId(movie) {
  if (!movie.id) {
    movie = assoc('id', cuid(), movie)
  }
  return movie
}




