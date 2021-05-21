const { validate } = require('./schema')
const verify = require('../lib/verify')
const { assoc, identity } = require('ramda')
const { Async } = require('crocks')
const cuid = require('cuid')
//const { identity } = require('crocks/combinators')

module.exports = (services) => {
  function post(review) {
    return Async.of(review) 
      .map(createId)
      .chain(validate)
      .map(assoc('type', 'review'))
      .chain(services.data.create)
      .chain(verify)
  }

  function put(id, review) {
    return Async.of(review)
      .map(assoc('id', id))
      .chain(validate)
      .map(assoc('type', 'review'))
      .chain(review => services.data.update(id, review))
      .chain(verify)
  }

  // function get(id) {
  //   return services.data.get(id).map(schema.parse)
  // }

  function get(id) {
    return services.data.get(id).chain(validate).bimap(e => ({status: 404, message: 'Review Not Found'}) , identity)

  }


 


  return {
    post,
    put,
    get
  }
}


function createId(review) {
  if (!review.id) {
    review = assoc('id', cuid(), review)
  }
  return review
}




