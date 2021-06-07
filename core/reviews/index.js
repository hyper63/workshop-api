const { validate, validateUserIsAuthor } = require('./schema')
const verify = require('../lib/verify')
const { assoc, identity, prop, map, propOr, mergeDeepRight} = require('ramda')
const { Async } = require('crocks')
const cuid = require('cuid')
const reactions = require('../reactions/index')

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
    return services.data.get(id)
      .chain(review => services.cache.get(`review-${id}`)
        .coalesce(() => review, counts => assoc('counts', counts, review))
      )
      .chain(validate).bimap(e => ({status: 404, message: 'Review Not Found'}) , identity)
  }

  function attachReviewCounts (review) {
    
      return Async.of(review)
      .chain(review => services.cache.get(`review-${review.id}`)
        .coalesce(() => review, counts => assoc('counts', counts, review))
      )
  }

  function shapeReviewCounts (review) {
    return mergeDeepRight({counts: {count: 0, like: 0, dislike: 0}}, review)
  }

// /**
//  * @param {object} selector
//  * @param {array} fields
//  * @param {number} limitß
//  */
//  function query(selector = {}, fields, limit = 20)
  function byMovie(id) {
    return services.data.query({
      type: 'review',
      movieId: id 
    }, null, 100)
    .chain(verify)
    .map(results => propOr([], "docs", results ))
    //.map(reviews => tap(x => console.log(JSON.stringify(x, null, 2)), reviews))
    .chain(reviews => Async.all(
      map(attachReviewCounts , reviews)
    ))
    .map(map(shapeReviewCounts))
    .map(reviews => assoc('docs', reviews, {ok: true}))
    .chain(verify)
  }

  function byUser(user) {
    return services.data.query({
      type: 'review',
      author: user
    }).chain(verify)
  }

  //const delDoc = ({id}) => services.data.del(id)

  

  function del({id, user}) {
    console.log('deleting review: ', id)

    return services.data.get(id)
    .chain(validate)
    .bimap(e => ({status: 404, message: 'Review Not Found'}) , identity)
    .chain(validateUserIsAuthor(user))
    .chain(review => reactions(services).byReview(id))
    .chain(verify)
    .map(prop('docs'))
    .chain(reviewReactions => Async.all(
      map(reaction => services.data.del(reaction.id) , reviewReactions)
    ))
    .chain(results => Async.all(map(verify, results)))
    .chain( _ => services.cache.del(`review-${id}`))
    .chain( _ => services.data.del(id))
    .chain(verify)
  }

  // `review-${reaction.reviewId}`

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
