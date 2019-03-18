const dotenv = require('dotenv').config({ path: '../.env' })
let connection = process.env.BOLT_CONNECTION
let connectionUser = process.env.BOLT_USER
let connectionPassword = process.env.BOLT_PASSWORD

var neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver(connection, neo4j.auth.basic(connectionUser, connectionPassword));
var session = driver.session();

module.exports = {
  query: function (query) {
    session
      .run(query)
      .then(function (result) {
        return result
      })
  },

  search(query) {
    try {
    }
    catch (e) {
      throw (e)
    }
  }
}