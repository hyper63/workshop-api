const { validate } = require('./schema')
const { all, assoc, propEq, identity } = require('ramda')
const { Async } = require('crocks')
const cuid = require('cuid')

module.exports = (services) => {
  function post(reaction) {
    return Async.of(reaction) 
      .map(createId)
      .chain(validate)
      .map(assoc('type', 'reaction'))
      .chain(reaction => Async.all([
        services.data.create(reaction),
        services.cache.inc(`review-${reaction.reviewId}`, reaction.reaction)
      ]))
      .map(all(propEq('ok', true)))
      .map(ok => ({ok}))

  }

  function byReview(id) {
    return services.data.query({
      type: 'reaction',
      reviewId: id
    })
  }

  // function put(id, reaction) {
  //   return Async.of(reaction)
  //     .map(assoc('id', id))
  //     .chain(validate)
  //     .map(assoc('type', 'reaction'))
  //     .chain(reaction => services.data.update(id, reaction))
  //     .chain(verify)
  // }

  // function get(id) {
  //   return services.data.get(id).chain(validate).bimap(e => ({status: 404, message: 'Reaction Not Found'}) , identity)
  // }

  return {
    post,
    byReview
    // put,
    // get
  }
}


function createId(reaction) {
  if (!reaction.id) {
    reaction = assoc('id', cuid(), reaction)
  }
  return reaction
}




