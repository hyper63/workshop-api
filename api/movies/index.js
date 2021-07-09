const { assoc } = require('ramda')
// POST /api/movies
exports.post = async ({user, body, core}, res, next) => {
  
  try {
    const movie = assoc('user', user, body)
    const result = await core.movies.post(movie).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

exports.search = ({core, body}, res, next) => {
  return core.movies.search(body)
  .fork(
    next,
    res.json.bind(res)
  )
}
  
