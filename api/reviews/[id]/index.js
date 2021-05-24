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

  exports.del = async ({core, user, params}, res, next) => {
    const {id} = params 
    console.log(`reviews.${id}.del request user: ${user}`)

    // https://3000-rose-porpoise-5vewhcdw.ws-us07.gitpod.io/api/reviews/roadhouse-1-tom. >> 
    //.  {"id":"roadhouse-1-tom","movieId":"roadhouse-1","rating":5,"summary":"Swayze Crazee","author":"Tom W."}
    const mockUser = 'Ott'
    console.log(`reviews.${id}.del request MOCK user: ${mockUser}`)

    try {
      const result = await core.reviews.del({id, user: mockUser}).toPromise()
      res.json(result)
    } catch (err) {
      next(err)
    }

  }
  