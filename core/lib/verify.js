const { Async, eitherToAsync, Either } = require('crocks')
const { Left, Right } = Either


module.exports = (result) => {
    console.log('verify result', JSON.stringify(result))
    
    return Async.of(result)
    .map(result => result.ok
    ? Right(result)
      : Left({ status: result.status, message: result.message })
    ).chain(eitherToAsync)

}

  
