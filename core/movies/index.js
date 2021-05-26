const { validate, validateCriteria } = require('./schema')
const verify = require('../lib/verify')
const { assoc, identity, prop, map, propEq, propOr, all, head } = require('ramda')
const { Async } = require('crocks')
const {Rejected, Resolved} = Async
const cuid = require('cuid')
const reviews = require('../reviews/index')

const isOK = propEq('ok', true)
const allOK = all(isOK)
const dataResult = head


const handleResults = results => allOK(results) ? Resolved({ ok: true })
: Rejected({ok: false, status: propOr( 400, "status" ,dataResult(results)), message: propOr( "Error saving data","message" ,dataResult(results)) })

/* data fail, search pass
  [
    {
      ok: false,
      status: 500,
      message: '{"error":"conflict","reason":"Document update conflict."}'
    },
    
    { ok: true }
  ]
  all pass
  [ { ok: true, id: 'caddyshack2' }, { ok: true } ] */



module.exports = (services) => {
  function post(movie) {
    return Async.of(movie)
      .map(createId)
      .chain(validate)
      .map(assoc('type', 'movie'))
      .chain(addMovie)
      .chain(handleResults)
      .chain(verify)
      
  }

  function addMovie (movie) {
      return Async.all( [
        services.data.create(movie),
        addMovieToIndex(movie)
      ])
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
    const key = `${movie.title}-${movie.year}`
    return services.search.create(key, movie)
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




