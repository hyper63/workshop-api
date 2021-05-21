exports.put = ({ core, body, params}, res, next) => 
  core.reviews.put(params.id, body)
    .fork(next, res.json.bind(res))

exports.get = async ({core, params}, res, next) => {
    const {id} = params
    try {
      const result = await core.reviews.get(id).toPromise()
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
  