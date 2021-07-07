const { validate, validateCriteria, validateAlreadyExists } = require('./schema')
const verify = require('../lib/verify')
const { assoc, identity, prop, propOr, map, flatten, compose, cond, lte, gte,T, always} = require('ramda')
const { Async } = require('crocks')
const cuid = require('cuid')
const reviews = require('../reviews/index')
const reactions = require('../reactions')
const Identity = require('crocks/Identity')

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
  
  function deleteMovieFromIndex (movie) {
    const key = `${movie.title}-${movie.year}`
    return services.search.del(key)
  }


  function updateMovieToIndex (movie) {
    const key = `${movie.title}-${movie.year}`
    return services.search.update(key, movie)
  }

  function deleteMovieStatsFromCache (id) {
    const key = `moviestats-${id}`
    return services.cache.del(key)
  }

  function put(id, movie) {
    return Async.of(movie)
      .map(assoc('id', id))
      .chain(validate)
      .map(assoc('type', 'movie'))
      .chain(movie => 
        get(id).chain(origMovie => 
          services.data.update(id, movie)
          .chain(() => updateMovieToIndex(movie))
          .bichain(rollbackUpdate(services.data, id ,origMovie), Async.Resolved)
          .map(({ ok }) => ({ ok, id: movie.id }))
          )
      )
        .chain(verify)
  }

  const calcStars = cond([
    [lte(0) && gte(.49),     always(0)],
    [lte(.5) && gte(1.49),   always(1)],
    [lte(1.5) && gte(2.49),  always(2)],
    [lte(2.5) && gte(3.49),  always(3)],
    [lte(3.5) && gte(4.49),  always(4)],
    [T,                     always(5)]
  ])

  function setStatsProps({avgRating}, movie) {
    avgRating = Number(avgRating.toFixed(2))
    const stars = calcStars(avgRating)

    return {...movie, avgRating, stars }

  }

  function get(id) {
    return services.data.get(id)
    .chain(movie => 
      services.cache.get(`moviestats-${movie.id}`)
      .bichain(Async.Resolved, Async.Resolved)
      .map(stats => {
        stats = {avgRating: propOr(0 ,'avgRating', stats)}
        return setStatsProps(stats, movie)
      })
    )
    .chain(validate)
    .bimap(e => ({status: 404, message: 'Movie Not Found'}) , identity)
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

  

  function rollbackDelete(dataService,origMovie, origReviews, origReactions) {
    return function () {
     
      return Async.of(origMovie)
              .chain(_ => dataService.create(origMovie))
              .chain(_ => Async.all( map((review) => reviews(services).post(review) , origReviews)))
              .chain(_ => Async.all( map((reaction) => reactions(services).post(reaction) , origReactions)))
              .chain(() => Async.Rejected({ ok: false, status: 500, message: 'could not delete search index' }))
    }
  }

  function del2(id) {
    return services.data.get(id)
    .chain(validate)
    .bimap(e => ({status: 404, message: 'Movie Not Found'}) , identity)
    .chain(origMovie => reviews(services).byMovie(id)
      .chain(verify)
      .map(prop('docs'))
      .chain(origReviews => Async.all(
          map(({id}) => reactions(services).byReview(id), origReviews) 
          ).chain(reactions => Async.all(map(verify, reactions)))
          .map(reactions => compose(
                  flatten,
                  map(prop("docs"))
                )(reactions)
              )
              .chain(origReactions => Async.all(
                  map(({id, author}) => reviews(services).del({id, user: author}) , origReviews)
                )
                .chain(results => Async.all(map(verify, results))
                  .chain( _ => services.data.del(id)
                      .chain(() => deleteMovieFromIndex(origMovie))
                      .chain(() => deleteMovieStatsFromCache(origMovie.id))
                      .bichain(rollbackDelete(services.data,origMovie, origReviews, origReactions), Async.Resolved)          
                      .map(({ ok }) => ({ ok, id: origMovie.id }))
                    )
                )
              )
            )
          )    
    .chain(verify)
  }


  function deleteMovieManual(id) {
    return services.data.get(id)
    .chain(validate)
    .bimap(e => ({status: 404, message: 'Movie Not Found'}) , identity)
    .chain( movie => {
        console.log('delManual movie', movie)
        return services.data.del(id).map(({ ok }) => ({ ok, id: origMovie.id }))
      }
    )
    .chain(verify)
  }

  function del(id) {
    return services.data.get(id)
    .chain(validate)
    .bimap(e => ({status: 404, message: 'Movie Not Found'}) , identity)
    .chain(origMovie => reviews(services).byMovie(id)
      .chain(verify)
      .map(prop('docs'))
      .chain(origReviews => Async.all(
          map(({id}) => reactions(services).byReview(id), origReviews) 
          ).chain(reactions => Async.all(map(verify, reactions)))
          .map(reactions => compose(
                  flatten,
                  map(prop("docs"))
                )(reactions)
              )
              .chain(origReactions => Async.all(
                  map(({id, author}) => reviews(services).del({id, user: author}) , origReviews)
                )
                .chain(results => Async.all(map(verify, results))
                  .chain( _ => services.data.del(id)
                      .chain(() => deleteMovieFromIndex(origMovie))
                      .bichain(rollbackDelete(services.data,origMovie, origReviews, origReactions), Async.Resolved)          
                      .map(({ ok }) => ({ ok, id: origMovie.id }))
                    )
                )
              )
            )
          )    
    .chain(verify)
  }

  function deleteSearchIndex(key) {
    return services.search.del(key)
  }

  function deleteCacheItem(key) {
    return services.cache.del(key)
  }

  function deleteCacheItem(key) {
    return services.cache.del(key)
  }

  function queryCacheManual(pattern) {
    return services.cache.list(pattern)
  }

  // movie.queryCacheManual)

  // _query?pattern=movie*


  return {
    post,
    put,
    get,
    del: del2,
    deleteMovieManual,
    deleteCacheItem,
    search,
    deleteSearchIndex,
    queryCacheManual
  }
}

function createId(movie) {
  if (!movie.id) {
    movie = assoc('id', cuid(), movie)
  }
  return movie
}




