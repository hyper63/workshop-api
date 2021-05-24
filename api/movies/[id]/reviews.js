module.exports = ({core, params}, res, next) =>
  core.reviews.byMovie(params.id)
    .fork(next, res.json.bind(res))

