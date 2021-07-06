
const checkScope = require('../api/lib/check-scope')
const createError = require('http-errors')
//const requestedAppJWTScopes = 'MOVIE:SEARCH MOVIE:READ REVIEW:* REACTION:*'
//const allowedScope = 'MOVIE:READ'

// Tuesday: Run and test this. 
module.exports = allowedScope => (req, res, next) => {

    console.log('verify-scope.js VERIFING SCOPE', allowedScope)
    if (!checkScope(req.user.scope, allowedScope)) {
        console.log('verify-scope.js DID NOT VERIFY the scope:', allowedScope)
        
        
        //res.status(401).json({ok: false, message: 'Not Authorized'})

        next(new createError.Unauthorized())
    } else {
        console.log('verify-scope.js SUCCESSFULLY VERFIED the scope:', allowedScope)
    }
   
    next()
}