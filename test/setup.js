const sinon = require('sinon')
const auth = require('../middleware/auth')


module.exports = () => {
  sinon.stub(auth, 'check').callsFake(function (req, res, next) {
    req.user = 'bob'
    next()
  })

}
