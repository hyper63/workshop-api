const test = require('tape')
const testServer = require('@twilson63/test-server')
const app = require('../server')

const fetch = require('node-fetch')

test('PUT /api/movies/:id success', async t => {
  t.plan(1)
  const server = testServer(app)

  const result = await (await fetch(server.url + '/api/movies/movie-1', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Avengers',
      year: '2012',
      actors: ['Robert Downey Jr'],
      genre: 'scifi'
    })
  })).json()

  t.ok(result.ok)
  server.close()
})


test('PUT /api/movies/:id invalid title', async t => {
  t.plan(2)
  const server = testServer(app)

  const result = await (await fetch(server.url + '/api/movies/movie-1', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      year: '2012',
      actors: ['Bobby'],
      genre: 'scifi'
    })
  })).json()
  t.equal(result.message, `["invalid_type: expected 'string' and received 'undefined' for the property 'title' - message: Required"]`)

  t.notOk(result.ok)
  server.close()
})
