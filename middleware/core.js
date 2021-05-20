const hyperServices = require('../services')
const core = require('../core')

module.exports = (req, res, next) => {
  // dependency injection --
  //req.core = core().runWith(hyperServices)
  req.core = core(hyperServices)
  next()
}
