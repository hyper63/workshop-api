const { validate, validateCriteria } = require('./schema')
const verify = require('../lib/verify')
const verifyIndexCreate = require('../lib/verify-index-create')
const { assoc, identity, prop, map } = require('ramda')
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
      .chain(addMovieToIndex)
      .chain(verify)
  }


  // function post(movie) {
  //   return Async.of(movie) 
  //     .map(createId)
  //     .chain(validate)
  //     .map(assoc('type', 'movie'))
  //     .chain(services.data.create)
  //     .chain(verify)
  // }

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


  function del(id) {
    return services.data.get(id)
    .chain(validate)
    .bimap(e => ({status: 404, message: 'Movie Not Found'}) , identity)
    .chain(review => reviews(services).byMovie(id))    
    .chain(verify)
    .map(prop('docs'))
    .chain(movieReviews => Async.all(
      map(({id, author}) => reviews(services).del({id, user: author}) , movieReviews)
    ))
    .chain(results => Async.all(map(verify, results)))
    .chain( _ => services.data.del(id))
    .chain(verify)
  }

  function addMovieToIndex (movie) {
    const name = "movies"
    const fields = ["title","year"]
    const storeFields = ["id", "title", "year", "actors", "genre"]
  
    const key = `${movie.title}-${movie.year}`


    console.log('core movies index.js addMovieToIndex: ')



    return services.search.createIndex(name, fields, storeFields)
    .chain(verifyIndexCreate)
    .chain(_ => services.search.create(name, key, movie ))

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




