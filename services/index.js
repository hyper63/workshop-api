const hyper = require('@hyper.io/connect')
const { Async } = require('crocks')

if (!globalThis.fetch) { 
  throw new Error('fetch is not defined')
}

const asyncFetch = Async.fromPromise(fetch)
const toJSON = res => {

  if (res.ok) {
    return Async.fromPromise(res.json.bind(res))()
  } else {
    return Async.fromPromise(res.text.bind(res))()
      .map(msg => ({ ok: false, status: res.status, message: msg}))
  }
}

module.exports = {
  data: {
    create,
    update,
    get
  },
  search: {
    query  
  },
  cache: {
  
  },
  storage: {
  
  }
}

/**
 * @param {string} query
 * @param {array} fields - ['title', 'year']
 * @param {object} filter - { type: 'movie' }
*/
function query(query, fields, filter) {
  return asyncFetch(hyper.url('search', '_query'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hyper.token()}`
    },
    body: JSON.stringify({ query, fields, filter})
  }).chain(toJSON)
}

function update(id, doc) {
  return asyncFetch(hyper.url('data', id), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hyper.token()}`
    },
    body: JSON.stringify(doc)
  }).chain(toJSON)
}

function create(doc) {
  return asyncFetch(hyper.url('data'), {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      Authorization: `Bearer ${hyper.token()}`
    },
    body: JSON.stringify(doc)
  }).chain(toJSON)
}

function get(id) {
  return asyncFetch(hyper.url('data', id ), {
      method: 'GET',
       headers: { 
          Authorization: `Bearer ${hyper.token()}`,
          Accept: 'application/json'
  }
  }).chain(toJSON)
}

