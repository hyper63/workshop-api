// POST /api/reviews
exports.post = async ({body, core}, res, next) => {
  try {
    const result = await core.reviews.post(body).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

exports.get = ({core, user}, res, next) => 
  core.reviews.byUser(user)
    .fork(next, res.json.bind(res))
