const { assoc } = require('ramda')
// POST /api/movies
exports.post = async ({user, body, core}, res, next) => {
  // what if no body
  const movie = assoc('user', user, body)
  try {
    const result = await core.movies.post(movie).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

exports.search = ({core, body}, res, next) => 
  core.movies.search(body)
    .fork(
      next,
      res.json.bind(res)
    )

