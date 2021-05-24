const fetchMock = require('fetch-mock')

// Mocks
globalThis.fetch = fetchMock.sandbox()
  .post('https://dev.hyper63.com/data/twilson63', { status: 201, body: { ok: true }})
  .put('https://dev.hyper63.com/data/twilson63/movie-1', { status: 200, body: {ok: true }})
  .post('https://dev.hyper63.com/data/twilson63/_query', { status: 200, body: {ok: true, docs: []}})
  .post('https://dev.hyper63.com/search/twilson63/_query', { status: 200, body: {ok: true, matches: []}})



// Tests

require('./health-check_test.js')
require('./movies-post-index_test.js')
require('./movies-put-id_test.js')
require('./reactions-by-review_test.js')
require('./movies-id-reviews_test.js')
require('./reviews-by-user_test.js')
require('./movies-search_test.js')
