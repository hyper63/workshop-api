req.isAllowedScope
const checkScope = require('../api/lib/check-scope')
const isAllowedScope = checkScope(req.user.scope)
    req.isAllowedScope = isAllowedScope
//const requestedAppJWTScopes = 'MOVIE:SEARCH MOVIE:READ REVIEW:* REACTION:*'
//const allowedScope = 'MOVIE:READ'

// Tuesday: Run and test this. 
module.exports = allowedScope => (req, res, next) => {
    if (!checkScope(req.user.scope, allowedScope)) {
        res.status(401).json({ok: false, message: 'Not Authorized'})
    }
    next()
}