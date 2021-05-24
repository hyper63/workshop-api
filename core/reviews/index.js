const { validate, validateUserIsAuthor } = require('./schema')
const verify = require('../lib/verify')
const { assoc, identity } = require('ramda')
const { Async } = require('crocks')
const cuid = require('cuid')

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

  function get(id) {
    return services.data.get(id).chain(validate).bimap(e => ({status: 404, message: 'Review Not Found'}) , identity)
  }

  function byMovie(id) {
    return services.data.query({
      type: 'review',
      movie: id 
    }).chain(verify)
  }


  function byUser(user) {
    return services.data.query({
      type: 'review',
      author: user
    }).chain(verify)
  }


  function del({id, user}) {

    console.log('>>>>>>>>>>>>>>>>>')
    console.log('>>>>>>>>>>>>>>>>>')
    console.log('core reviews index.js del', {id, user})

    //const review = get(id)

    //console.log('review: ', review)

    //const {author} = review
    //console.log('author: ', author)

    return services.data.get(id).chain(validateUserIsAuthor(user))

    // if (author != user) {

    //   return {status: 400, message: `Current logged in user: ${user} is not the author of review.`}


    // }

    /* delete review 
    TODO:  Get the review by id
    TODO:  Get the author prop off the review
    

    NOTE: Only the author of the review can remove the review
    NOTE: the business logic should cascade and remove all reactions to a given review
  */

    
  }

  

  return {
    post,
    put,
    get,
    byMovie,
    byUser,
    del
  }
}


function createId(review) {
  if (!review.id) {
    review = assoc('id', cuid(), review)
  }
  return review
}




