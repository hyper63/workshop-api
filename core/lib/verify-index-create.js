const { Async, eitherToAsync, Either } = require('crocks')
const { Left, Right } = Either

module.exports = (result) =>
  Async.of(result)
    .map(result => {
        console.log('lib/verify-index-create result: ', result)
        return result.ok
        ? Right(result)
          : Left({ status: result.status, message: result.message })
    })
    .chain(eitherToAsync)
