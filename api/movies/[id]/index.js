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
  
