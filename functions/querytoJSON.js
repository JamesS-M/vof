// const query = require('/Users/james/Documents/cs/OperaticFame/vof/functions/query.js')
const dotenv = require('dotenv').config({ path: '../.env' })
const functions = require('../functions/functions.js')
let connection = process.env.BOLT_CONNECTION
let connectionUser = process.env.BOLT_USER
let connectionPassword = process.env.BOLT_PASSWORD

var neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver(connection, neo4j.auth.basic(connectionUser, connectionPassword));
var session = driver.session();

// let search = 'match(z:ORIGIN)-[r]-(n) where z.user = "Estelle" return r,n'
let search = 'Match(z)--(n), (z)--(m), (n)-[r]-(m) where z.user="Estelle" and not n:Origin and not m:Origin return n,m,r limit 10000000'

session
  .run(search)
  .then(function (result) {

    let colorCache = []
    let array = result.records
    let data = {
      nodes: [],
      links: []
    }

    for (let i = 0; i < array.length; i++) {

      // Assigns different names and colours depending on the type of label
      let keys = Object.keys(array[i].toObject())

      for (let j = 0; j < keys.length; j++) {
        if (!/keys\(/.exec(keys[j])) {
          let isNode, color, newObj
          let obj = array[i].toObject()[keys[j]]
          // isNode = obj.labels ? true : false

          if (obj.labels) {
            // NODE
            if (!colorCache.find(o => o.label === obj.labels[0])) {
              color = functions.getRandomColor(obj)
              colorCache.push({
                label: obj.labels[0],
                color: color
              })
            } else {
              color = colorCache.find(o => o.label === obj.labels[0]).color
            }

            newObj = {
              name: functions.findName(obj),
              id: obj.identity.low,
              properties: obj.properties,
              labels: obj.labels,
              color: color,
              relationshipCount: {},
              labelCount: {}
            }
            data.nodes.push(newObj)
          } else {
            // LINK
            newObj = {
              name: obj.type,
              id: obj.identity.low,
              start: obj.start.low,
              end: obj.end.low
            }
            data.links.push(newObj)
          }
        }
      }
    }
    return data
  })
  .then((data) => {
    console.log(data);
    console.log('finished')
    driver.close()
  })