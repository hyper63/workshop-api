const { validate, validateCriteria, validateAlreadyExists } = require('./schema')
const verify = require('../lib/verify')
const { assoc, identity, prop, map, flatten, compose} = require('ramda')
const { Async } = require('crocks')
const cuid = require('cuid')
const reviews = require('../reviews/index')
const reactions = require('../reactions')

module.exports = (services) => {

  function post(movie) {

    //Async.of(movie)
    /*
  .map(createId)
            .chain(movie => services.data.get(movie.id))
            .chain(validateAlreadyExists)

            .chain(validate)
    
    */
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
// const key = `${movie.title}-${movie.year}`
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

  

  function rollbackDelete(dataService,origMovie, origReviews, origReactions) {
    return function () {
     // console.log('rolling back', {origMovie,origReviews, origReactions})
      return Async.of(origMovie)
              .chain(_ => dataService.create(origMovie))
              .chain(_ => Async.all( map((review) => reviews(services).post(review) , origReviews)))
              .chain(_ => Async.all( map((reaction) => reactions(services).post(reaction) , origReactions)))
              .chain(() => Async.Rejected({ ok: false, status: 500, message: 'could not delete search index' }))
    }
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
    /*
    return Async.of(key)
    .chain(() => deleteMovieFromIndex(key))
    .bichain(Async.Rejected, Async.Resolved)          
    .map(({ ok }) => ({ ok, id: key }))
    */
  }




 

  return {
    post,
    put,
    get,
    del,
    search,
    deleteSearchIndex
  }
}


function createId(movie) {
  if (!movie.id) {
    movie = assoc('id', cuid(), movie)
  }
  return movie
}




