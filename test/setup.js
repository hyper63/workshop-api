const sinon = require('sinon')
const auth = require('../middleware/auth')


module.exports = () => {
  const stub = sinon.stub(auth, 'check')

  stub.callsFake(function (req, res, next) {
    req.user = 'bob'
    next()
  })
}
