exports.put = ({ core, body, params}, res, next) => 
  core.reviews.put(params.id, body)
    .fork(next, res.json.bind(res))

exports.get = async ({core, params}, res, next) => {
    try {
      const {id} = params
      const result = await core.reviews.get(id).toPromise()
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  exports.del = async ({core, user, params}, res, next) => {
    try {
      const {id} = params 
      const result = await core.reviews.del({id, user: user.sub}).toPromise()
      res.json(result)
    } catch (err) {
      next(err)
    }

  }
  