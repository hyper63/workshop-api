const fetchMock = require('fetch-mock')

// Mocks
globalThis.fetch = fetchMock.sandbox()
  .post('https://dev.hyper63.com/data/twilson63', { status: 201, body: { ok: true }})


// Tests

require('./health-check_test.js')
require('./movies-post-index_test.js')


