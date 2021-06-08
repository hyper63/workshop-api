module.exports = ({core, params, query}, res, next) =>
  core.reviews.byMovie({id: params.id,  options: { startIndex: query.startindex || 0, pageSize : query.pagesize || 5 }}   )
    .fork(next, res.json.bind(res))

    