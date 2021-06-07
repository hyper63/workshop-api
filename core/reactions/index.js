const { validate } = require('./schema')
const {  assoc } = require('ramda')
const { Async } = require('crocks')
const cuid = require('cuid')
const verify = require('../lib/verify')

function rollbackPost(data, id) {
  return function () {
    return data.del(id)
      .chain(() => Async.Rejected({ ok: false, status: 500, message: 'could not increment cache' }))
  }
}


// function rollbackDelete(data, reaction) {
//   return function () {
//     return data.create(reaction)
//       .chain(() => Async.Rejected({ ok: false, status: 500, message: 'could not decrement cache' }))
//   }
// }

module.exports = (services) => {

  function post(reaction) {

    console.log('post reaction:' , reaction)
    return Async.of(reaction)
      .map(createId)
      .chain(validate)
      .map(assoc('type', 'reaction'))
      .chain(reaction =>
        services.data.create(reaction)
          .chain(() => services.cache.increment(`review-${reaction.reviewId}`, reaction.reaction))
          .bichain(rollbackPost(services.data, reaction.id), Async.Resolved)
          .map(({ ok }) => ({ ok, id: reaction.id }))
      )
      .chain(verify)

  }

  function byReview(id) {
    return services.data.query({
      type: 'reaction',
      reviewId: id
    })
  }

  // function del(reaction) {
  //   console.log('deleting reaction: ', reaction.id)
  //   return services.data.del(reaction.id)
  //     .chain(() => services.cache.decrement(`review-${reaction.reviewId}`, reaction.reaction))
  //     .bichain(rollbackDelete(services.data, reaction), Async.Resolved)
  //         .map(({ ok }) => ({ ok, id: reaction.id }))
  // }


  // return services.data.get(id)
  //     .chain(review => services.cache.get(`review-${id}`)
  //       .coalesce(() => review, counts => assoc('counts', counts, review))
  //     )
  //     .chain(validate).bimap(e => ({status: 404, message: 'Review Not Found'}) , identity)

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
    byReview,
    //del
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




