const dotenv = require('dotenv').config()

let connection = process.env.BOLT_CONNECTION
let connectionUser = process.env.BOLT_USER
let connectionPassword = process.env.BOLT_PASSWORD

const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(connection, neo4j.auth.basic(connectionUser, connectionPassword))
const session = driver.session()

session
  .run('Match (n) detach delete n')
  .then(function (result) {
    console.log(`Deleted ${result.summary.counters._stats.nodesDeleted} nodes and ${result.summary.counters._stats.relationshipsDeleted} relationships in ${result.summary.resultAvailableAfter} ms`)
    driver.close()
  })
