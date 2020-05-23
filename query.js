require('dotenv').config()

const bolt = process.env.BOLT_CONNECTION
const user = process.env.BOLT_USER
const pass = process.env.BOLT_PASSWORD

const neo4j = require('neo4j-driver')
const driver = neo4j.driver(bolt, neo4j.auth.basic(user, pass))

const query = async (q) => await driver.session(neo4j.session.WRITE).run(q)

module.exports = performQueries = async (queries) => {
  for (let i = 0; i < queries.length; i++) {
    let total = queries.length
    try {
      await query(queries[i]).then(() => {
        console.log(`row: ${i + 1} / ${total} (${((i + 1) / total * 100).toFixed(2)}%)`)
      })
    } catch (err) {
      console.log(err)
      process.exit()
    }
  }
}