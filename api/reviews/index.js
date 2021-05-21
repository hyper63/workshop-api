const { assoc } = require('ramda')
// POST /api/reviews
exports.post = async ({user, body, core}, res, next) => {
  // what if no body
  const review = assoc('user', user, body)

  try {
    const result = await core.reviews.post(review).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}
