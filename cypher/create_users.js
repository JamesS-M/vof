const dotenv = require('dotenv').config()

let connection = process.env.BOLT_CONNECTION
let connection_user = process.env.BOLT_USER
let connection_password = process.env.BOLT_PASSWORD


const neo4j = require('neo4j-driver').v1
const md5 = require('md5')
const driver = neo4j.driver(connection, neo4j.auth.basic(connection_user, connection_password));
const session = driver.session();


let query
let user = []
let users = process.env.USERS.split(',')
users.forEach((value)=>{user.push(value)})

function execute (query) {
  console.log(query)
  session
  .run(query)
  .then(function () {
    driver.close()
  })  
}



for (let i = 0; i < user.length; i++) {
  let username = /\{([A-z]*):([A-z]*)/.exec(user[i])[1]
  let password = md5(/\{([A-z]*):([A-z]*)/.exec(user[i])[2])
  query = 'MERGE (n:Origin {user:"'+username+'", password:"'+password+'"})'
  execute(query)
}


    



