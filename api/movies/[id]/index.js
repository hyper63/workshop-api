exports.put = ({ core, body, params}, res, next) => 
  core.movies.put(params.id, body)
    .fork(next, res.json.bind(res))

exports.get = async ({core, params, user, isAllowedScope}, res, next) => {
    try {
      const {id} = params
      const result = await core.movies.get(id).toPromise()
      res.json(result)
    } catch (err) {
      console.log('err whut!', err)
      next(err)
    }
  }

exports.del = async ({core, user, params}, res, next) => {
  try {
    const {id} = params 
    const result = await core.movies.del(id).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }

}

exports.deleteMovieManual = async ({core, user, params}, res, next) => {
  try {
    const {id} = params 
    const result = await core.movies.deleteMovieManual(id).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

exports.deleteSearchIndexManual = async ({core, params}, res, next) => {
  try {
    const {key} = params 
    const result = await core.movies.deleteSearchIndex(key).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

exports.deleteCacheIndexManual = async ({core, params}, res, next) => {
  try {
    const {key} = params 
    const result = await core.movies.deleteCacheItem(key).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

exports.queryCacheManual = async ({core, params}, res, next) => {
  try {
    const {pattern} = params 
    const result = await core.movies.queryCacheManual(pattern).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}
