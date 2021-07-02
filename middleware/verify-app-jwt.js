const jwt = require('jsonwebtoken')

const checkScope = require('../api/lib/check-scope')

//const requestedAppJWTScopes = 'MOVIE:SEARCH MOVIE:READ REVIEW:* REACTION:*'
//const allowedScope = 'MOVIE:READ'



module.exports = (req, res, next) => {
    //const {session} = req
    
    const APP_SECRET = process.env.APP_SECRET
    const {last, split, compose} = require('ramda')
    console.log('easklfnlqwieuhri', req.headers.authorization)
    
    const token = compose(
        last,
        split(" ")
      ) 
      (req.headers.authorization) || null
    
    

    console.log('verify-app-jwt.js token', token )
    req.user = jwt.verify(token, APP_SECRET)

    //const isAllowedScope = checkScope(requestedAppJWTScopes)
    
    // console.log('API Middleware verify-app-jwt.js')

    // console.log('req.headers.authorization', req.headers.authorization)
    // console.log('token', token)
    // console.log(`req.user`, req.user )

    next()
}
  