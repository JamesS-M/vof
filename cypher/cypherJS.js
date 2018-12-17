const dotenv = require('dotenv').config()

let connection = process.env.BOLT_CONNECTION
let conenctionUser = process.env.BOLT_USER
let connectionPassword = process.env.BOLT_PASSWORD

const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(connection, neo4j.auth.basic(conenctionUser, connectionPassword))
const session = driver.session()

let query = 'match (n)-[r]-(m)  return n,r'

session
  .run(query)
  .then(function (result) {
    // (result.records[0])
    // (result.records[0].toObject().n.identity)
    // (result.records[0].toObject().n.labels)
    // (result.records[0].toObject().n.properties)
    // (result.records[0].toObject().r)

    for (let i = 0; i < result.records.length; i++) {
      console.log(result.records[i])
      console.log(result.records[i].toObject().n.identity)
      console.log(result.records[i].toObject().n.labels)
      console.log(result.records[i].toObject().n.properties)
      console.log(result.records[i].toObject().r)
      console.log('-----------------------------------')
    }
    driver.close()
  })
