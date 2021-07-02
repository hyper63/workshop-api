const jwt = require('jsonwebtoken')


module.exports = (req, res, next) => {
    //const {session} = req
    
    const APP_SECRET = process.env.APP_SECRET
    const {last, split, compose} = require('ramda')
    //console.log('easklfnlqwieuhri', req.headers.authorization)
    
    const token = compose(
        last,
        split(" ")
      ) 
      (req.headers.authorization) || null
    
    console.log('verify-app-jwt.js token', token )
    req.user = jwt.verify(token, APP_SECRET)

    //TUESDAY AFTER 4th
    // TODO.  Send 401 - unauthorized if jwt does not verify or error.  Need to investigate how this behaves.
    // TODO enhance the security model by setting and validating expiration, audience and issuer https://github.com/auth0/node-jsonwebtoken 
    next()
}
  