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
  author: z.string(),
  counts: z.object({
    count: z.number(),
    like: z.number().optional(),
    dislike: z.number().optional()
  }).optional()
})

function validate (review) {
  return Async.of(review)
  .map(schema.safeParse)
  .map(({success, data, error}) =>  success 
    ? Right(data) 
    : Left(formatErrors(error))
  ).chain(eitherToAsync)
} 


const validateUserIsAuthor = (user) => (review) => Async.of(review)
.map( ({author}) => user === author 
? Right(review)
: Left({
  status: 400,
  message: `Current logged in user: ${user} is not the author of review.`
}) ).chain(eitherToAsync)

 
module.exports = {
  validate,
  validateUserIsAuthor,
  schema
}
