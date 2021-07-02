exports.put = ({ core, body, params}, res, next) => 
  core.movies.put(params.id, body)
    .fork(next, res.json.bind(res))

exports.get = async ({core, params, user, isAllowedScope}, res, next) => {

  //isAllowedScope(allowedScope)
    
    console.log('movies/[id]/index.js get() req.user', user)
    const {id} = params
  
    try {
      const result = await core.movies.get(id).toPromise()

  
      res.json(result)
    } catch (err) {
      console.log('err whut!', err)
      next(err)
    }
  
  }

  exports.del = async ({core, user, params}, res, next) => {
    const {id} = params 
    console.log(`movies.${id}.del request`)

    // https://3000-indigo-cougar-6v63rznm.ws-us07.gitpod.io/api/movies/commando-1 >> 
    //  {"id":"commando-1","title":"Commando","year":"1986","actors":["Arnold"],"genre":"action"}
    try {
      const result = await core.movies.del(id).toPromise()
      res.json(result)
    } catch (err) {
      next(err)
    }

  }

  
  
exports.deleteSearchIndex = async ({core, params}, res, next) => {
  const {key} = params 
  console.log(`movies.${key}.deleteSearchIndex request`)

  // https://3000-indigo-cougar-6v63rznm.ws-us07.gitpod.io/api/movies/commando-1 >> 
  //  {"id":"commando-1","title":"Commando","year":"1986","actors":["Arnold"],"genre":"action"}
  try {
    const result = await core.movies.deleteSearchIndex(key).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }

}