const { map } = require('ramda')

module.exports = formatErrors

function formatErrors(error) {
  return {
    status: 400,
    message: JSON.stringify(
      map(
        (error) => `${error.code}: expected '${error.expected}' and received '${error.received}' for the property '${error.path.join('.')}' - message: ${error.message}`
        , error.issues
      )
    )
  }
}