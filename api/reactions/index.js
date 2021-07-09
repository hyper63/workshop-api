exports.post = async ({body, core}, res, next) => {
  try {
    const result = await core.reactions.post(body).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

exports.del = async ({core, user, params}, res, next) => {
  try {
    const {id} = params 
    const result = await core.reactions.del({id, user}).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}
