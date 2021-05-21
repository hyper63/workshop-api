const { assoc } = require('ramda')
// POST /api/reactions
exports.post = async ({user, body, core}, res, next) => {
  // what if no body


   // TODO:  Figure out why no user from session
  //const reaction = assoc('user', user, body)
  const reaction =  body

  try {
    const result = await core.reactions.post(reaction).toPromise()
    res.json(result)
  } catch (err) {
    next(err)
  }
}
