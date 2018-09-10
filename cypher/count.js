const dotenv = require('dotenv').config()

let connection = process.env.BOLT_CONNECTION
let connection_user = process.env.BOLT_USER
let connection_password = process.env.BOLT_PASSWORD

const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(connection, neo4j.auth.basic(connection_user, connection_password));
const session = driver.session();

session
.run('Match (n) return count(n)')
.then(function (result) {
  console.log('Found '+result.records[0].toObject(0)['count(n)'].low+' nodes in '+result.summary.resultAvailableAfter + 'ms')
  driver.close()
})  
