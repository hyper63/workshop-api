require('dotenv').config()
const fetchMock = require('fetch-mock')

const {HYPER_APP_NAME} = process.env

// Mocks
globalThis.fetch = fetchMock.sandbox()

  .post(`https://dev.hyper63.com/data/${HYPER_APP_NAME}`, { status: 201, body: { ok: true }})
  .put(`https://dev.hyper63.com/data/${HYPER_APP_NAME}/movie-1`, { status: 200, body: {ok: true }})
  .get(`https://dev.hyper63.com/data/${HYPER_APP_NAME}/movie-1`, { status: 200, body: {id: "movie-1", title:"caddyshack", year:"1980", actors:[], genre:"comedy", type:"movie"}})
  .post(`https://dev.hyper63.com/data/${HYPER_APP_NAME}/_query`, { status: 200, body: {ok: true, docs: []}})
  .post(`https://dev.hyper63.com/search/${HYPER_APP_NAME}/_query`, { status: 200, body: {ok: true, matches: []}})
  .post(`https://dev.hyper63.com/search/${HYPER_APP_NAME}`, { status: 201, body: {ok: true}})
  .post(`https://dev.hyper63.com/cache/${HYPER_APP_NAME}`, { status: 201, body: {ok: true}})
  .get(`https://dev.hyper63.com/cache/${HYPER_APP_NAME}/review-ghostbusters-1-tom`, { status: 200, body: { count: 1, like: 1}})


// stub auth
require('./setup')()

// Tests
require('./health-check_test.js')
require('./movies-post-index_test.js')
require('./movies-put-id_test.js')
require('./reviews-post-index_test')
require('./movies-id-reviews_test.js')
require('./reviews-by-user_test.js')
require('./movies-search_test.js')
require('./reactions-post-index_test.js')
require('./reactions-by-review_test.js')
require('./auth_test.js')


// unit tests
require('./auth_test.js')
