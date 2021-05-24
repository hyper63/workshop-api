const { assoc } = require('ramda')
// POST /api/reviews
exports.post = async ({user, body, core}, res, next) => {
  // what if no body
  //const review = assoc('author', user, body)
  const review = body

  try {
    const result = await core.reviews.post(review).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

exports.get = ({core, user}, res, next) => 
  core.reviews.byUser(user)
    .fork(next, res.json.bind(res))
