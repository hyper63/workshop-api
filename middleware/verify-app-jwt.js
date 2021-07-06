const jwt = require('jsonwebtoken')
const createError = require('http-errors')

module.exports = (req, res, next) => {
  
  try {
    const APP_SECRET = process.env.APP_SECRET
    const {last, split, compose} = require('ramda')
    
    
    const token = compose(
        last,
        split(" ")
      ) 
      (req.headers.authorization) || null
    
      const verifyResult = jwt.verify(token, APP_SECRET)
      req.user = verifyResult
      console.log('verify-app-jwt.js JWT VALIDATED!  payload:', req.user)


    } catch(err) {
      console.log('***** verify-app-jwt.js JWT DID NOT VALIDATE!!!! *****' )
      console.log('err', err)
      next(new createError.Unauthorized())
    }

    
    

   

    //TUESDAY AFTER 4th
    // TODO.  Send 401 - unauthorized if jwt does not verify or error.  Need to investigate how this behaves.
    // TODO enhance the security model by setting and validating expiration, audience and issuer https://github.com/auth0/node-jsonwebtoken 
    next()
}
  