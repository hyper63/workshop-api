const tokenUrl = 'https://github.com/login/oauth/access_token'
const userUrl = 'https://api.github.com/user'

const clientId = process.env.CLIENT_ID
const secret = process.env.CLIENT_SECRET


module.exports = async (req, res) => {
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
    req.session.user = user
    req.session.token = result.access_token
    res.json({ user })
  }
  res.status(400).json({ok: false})
}
