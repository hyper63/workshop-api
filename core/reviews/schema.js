const { Async, Either, eitherToAsync } = require('crocks')
const { Left, Right } = Either
const z = require('zod')
const formatErrors = require('../lib/format-errors')

// {
//   "id": "string",
//   "movieId": "string",
//   "rating": 5,
//   "summary": "string",
//   "author": "string"
// }


const schema = z.object({
  id: z.string(),
  movieId: z.string(),
  rating: z.number().int().min(1).max(5),
  summary: z.string(),
  author: z.string()
})

function validate (review) {
  return Async.of(review)
  .map(schema.safeParse)
  .map(({success, data, error}) =>  success 
    ? Right(data) 
    : Left(formatErrors(error))
  ).chain(eitherToAsync)
} 
 
module.exports = {
  validate,
  schema
}