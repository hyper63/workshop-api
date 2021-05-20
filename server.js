const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./openapi.json')


const app = express()

app.use(cors())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


app.get('/', (req, res) => res.json({name: 'movie review api'}))

if (!module.parent) {
  app.listen(3000)
}
