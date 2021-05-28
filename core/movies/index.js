const { validate, validateCriteria } = require('./schema')
const verify = require('../lib/verify')
const { assoc, identity, prop, map} = require('ramda')
const { Async } = require('crocks')
const cuid = require('cuid')
const reviews = require('../reviews/index')

module.exports = (services) => {

  function post(movie) {
    return Async.of(movie)
      .map(createId)
      .chain(validate)
      .map(assoc('type', 'movie'))
      .chain(movie => 
        services.data.create(movie)
          .chain(() => addMovieToIndex(movie))
          .bichain(rollbackAdd(services.data, movie.id), Async.Resolved)
          .map(({ ok }) => ({ ok, id: movie.id }))
        )
        .chain(verify)
  }

  function rollbackAdd(dataService, id) {
    return function () {
      return dataService.del(id)
        .chain(() => Async.Rejected({ ok: false, status: 500, message: 'could not add to search index' }))
    }
  }

  function rollbackUpdate(dataService, id, origData) {
    return function () {
      return dataService.update(id, origData)
        .chain(() => Async.Rejected({ ok: false, status: 500, message: 'could not update search index' }))
    }
  }
  
  
  function addMovieToIndex (movie) {
    const key = `${movie.title}-${movie.year}`
    return services.search.create(key, movie)
  }
  
  function put(id, movie) {
    return Async.of(movie)
      .map(assoc('id', id))
      .chain(validate)
      .map(assoc('type', 'movie'))
      .chain(movie => 
        get(id).chain(origMovie => 
          services.data.update(id, movie)
          .chain(() => addMovieToIndex(movie))
          .bichain(rollbackUpdate(services.data, id ,origMovie), Async.Resolved)
          .map(({ ok }) => ({ ok, id: movie.id }))
          )
      )
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
            null, 
            doc.filter
        )
      )
      .chain(verify)
  }

  function deleteMovieFromIndex (movie) {
    const key = `${movie.title}-${movie.year}`
    return services.search.del(key)
  }

  function rollbackDelete(dataService,origMovie, origMovieReviews) {
    return function () {
      return Async.all(
        map((review) => reviews(services).post(review) , origMovieReviews)
      )
        .chain( _ => dataService.post(origMovie)
          .chain(() => Async.Rejected({ ok: false, status: 500, message: 'could not delete search index' }))
        )
    }
  }

  function del(id) {
    return services.data.get(id)
    .chain(validate)
    .bimap(e => ({status: 404, message: 'Movie Not Found'}) , identity)
    .chain(origMovie => reviews(services).byMovie(id)
      .chain(verify)
      .map(prop('docs'))
      .chain(origMovieReviews => Async.all(
          map(({id, author}) => reviews(services).del({id, user: author}) , origMovieReviews)
        )
        .chain(results => Async.all(map(verify, results))
          .chain( _ => services.data.del(id)
              .chain(() => deleteMovieFromIndex(origMovie))
              .bichain(rollbackDelete(services.data, id ,origMovie, origMovieReviews), Async.Resolved)
              .map(({ ok }) => ({ ok, id: origMovie.id }))
            )
        )
      )
    )    
    
    
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




