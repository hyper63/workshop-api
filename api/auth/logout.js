module.exports = (req, res) => {
  req.session.regenerate(() => res.json({ok: true}))
}
