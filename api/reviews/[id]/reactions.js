exports.get = ({core, params}, res, next) =>
  core.reactions.byReview(params.id)
    .fork(
      next,
      res.json.bind(res)
    )

