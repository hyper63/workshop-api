const { Async, Either, eitherToAsync } = require('crocks')
const { Left, Right } = Either
const z = require('zod')
const formatErrors = require('../lib/format-errors')

const schema = z.object({
  id: z.string(),
  reviewId: z.string(),
  reaction: z.enum(['like', 'dislike']),
  user: z.string()
})

function validate (reaction) {
  return Async.of(reaction)
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