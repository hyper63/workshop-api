const { validate, validateCriteria } = require('./schema')
const verify = require('../lib/verify')
const { assoc, identity } = require('ramda')
const { Async } = require('crocks')
const cuid = require('cuid')
const reviews = require('../reviews/index')

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
    return services.data.get(id).chain(validate).bimap(e => ({status: 404, message: 'Movie Not Found'}) , identity)
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

  const delDoc = ({id}) => services.data.del(id)


  function del({id, user}) {

    // DONE: Get all reviews for the movie id
    // NEEDS VERIFICATION: map over the reviews, and delete reviews and reactions using review id and author as the user
    // NEEDS VERIFICATION: Delete the movie.

    return services.data.get(id)
    .chain(validate)
    .bimap(e => ({status: 404, message: 'Review Not Found'}) , identity)
    .chain(review => reviews(services).byMovie(id))
    .chain(verify)
    .map(prop('docs'))
    .chain(reviews => Async.all(
      map(({id, author}) => reviews(services).del({id, user: author}) , reviews)
    ))
    .chain(results => Async.all(map(verify, results)))
    .chain( _ => services.data.del(id))
    .chain(verify)
  }

  return {
    post,
    put,
    get,
    del,
    search
  }
}


function createId(movie) {
  if (!movie.id) {
    movie = assoc('id', cuid(), movie)
  }
  return movie
}




