exports.put = ({ core, body, params}, res, next) => 
  core.movies.put(params.id, body)
    .fork(next, res.json.bind(res))

exports.get = async ({core, params}, res, next) => {
    
    console.log('**********')
    console.log('hyper', process.env.HYPER)
    console.log('**********')
    const {id} = params
  
    try {
      const result = await core.movies.get(id).toPromise()
      res.json(result)
    } catch (err) {
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
  
