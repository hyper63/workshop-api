const { validate, schema } = require('./schema')
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

  function get(id) {
    return services.data.get(id).map(schema.parse)
  }

  return {
    post,
    get

  }
}


function createId(movie) {
  if (!movie.id) {
    movie = assoc('id', cuid(), movie)
  }
  return movie
}




