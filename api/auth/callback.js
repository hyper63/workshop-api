const tokenUrl = 'https://github.com/login/oauth/access_token'
const userUrl = 'https://api.github.com/user'

const clientId = process.env.CLIENT_ID
const secret = process.env.CLIENT_SECRET


module.exports = async (req, res) => {
  console.log('workshop-api/auth/callback.js clientId: ', clientId)
  console.log('fetching tokenURL: ', tokenUrl)
  console.log('request body',{
    client_id: clientId,
    client_secret: secret,
    code: req.query.code,
    state: req.query.state
  } )
  if (req.query.state === req.session.id) {
    const result = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
          client_id: clientId,
          client_secret: secret,
          code: req.query.code,
          state: req.query.state
        })
    }).then(res => res.json())

    const user = await fetch(userUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          authorization: `Bearer ${result.access_token}`
        }
      }).then(res => res.json())
    // req.session.user = user
    // req.session.token = result.access_token
      console.log('>>>>>>>>>>>>>>>>>>>>>')
      console.log('>>>>>>>>>>>>>>>>>>>>>')
      console.log('api/auth/callback.js')
    
      console.log('user: ', user)
      console.log('token: ', result.access_token)
      req.session.user = user


    req.session.token = result.access_token
    console.log('')
    console.log('req.session.user: ' , req.session.user)
    console.log('req.session.token: ', req.session.token)
    console.log('<<<<<<<<<<<<<<<<<<<<<<')
    console.log('<<<<<<<<<<<<<<<<<<<<<<')
    res.json({ user })
  }
  res.status(400).json({ok: false})
}
