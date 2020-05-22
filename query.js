module.exports = function query(queryString, session) {
  return session
    .run(queryString)
    .then(() => console.log('done'))
}