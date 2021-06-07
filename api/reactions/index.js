const { assoc } = require('ramda')
// POST /api/reactions
exports.post = async ({user, body, core}, res, next) => {
  // what if no body
  //const reaction = assoc('user', user, body)
  const reaction =  body

  try {
    const result = await core.reactions.post(reaction).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}


exports.post = async ({user, body, core}, res, next) => {
  // what if no body
  //const reaction = assoc('user', user, body)
  const reaction =  body

  try {
    const result = await core.reactions.post(reaction).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

exports.del = async ({core, user, params}, res, next) => {
  const {id} = params 
  console.log(`reactions.${id}.del request`)

  // https://3000-rose-porpoise-5vewhcdw.ws-us07.gitpod.io/api/reviews/roadhouse-1-tom. >> 
  //.  {"id":"roadhouse-1-tom","movieId":"roadhouse-1","rating":5,"summary":"Swayze Crazee","author":"Tom W."}

  try {
    const result = await core.reactions.del({id, user: mockUser}).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }

}

