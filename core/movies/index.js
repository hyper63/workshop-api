const validate = require('./schema')
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


  return {
    post,
    put
  }
}


function createId(movie) {
  if (!movie.id) {
    movie = assoc('id', cuid(), movie)
  }
  return movie
}

