const dotenv = require('dotenv').config()

let connection = process.env.BOLT_CONNECTION
let connection_user = process.env.BOLT_USER
let connection_password = process.env.BOLT_PASSWORD

const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(connection, neo4j.auth.basic(connection_user, connection_password));
const session = driver.session();

let query = 'MATCH(n)-[r]-(m) where id(n)= 43021 and not n:Origin and not m:Origin return keys(n), keys(m), keys(r), n,m,r'

let t = new Date
let t2
let t3


let labelMap = {};
let relationshipMap = {};
let propertyMap = {};

// let countMap = {}
// countMap.labelConnections = []


let arr = [{name: 'James', count: 15}, {name: 'Paul', count: 10}, {name: 'Estelle', count: 20}]
// (arr.find(function(n) {
//   return n.count > 12
// }))
(arr.sort(function(a,b){
  return b.count - a.count
}))



function addConnection (connections, nodeToAdd) {
  
  nodeToAdd.forEach(function (node) {

    let currentNode = connections.find(function (nodes) {
      return nodes.name == node
    })

    if (!currentNode) {
      currentNode = {name: label, type:'label', count: 0, connections: []}
      connections.push(currentNode)
    }

    currentNode.count++

  })
}

session
.run(query)
.then(function (result) {

  // let labels = []

  let countMap = {}

  driver.close()
  t2 = new Date
  countMap.labelConnections = []

  for (var i = 0; i < result.records.length; i++) {

    let m = result.records[i].toObject().m
    let n = result.records[i].toObject().n
    let r = []
    r.push(result.records[i].toObject().r.type)


    //============================== Counting labels starts ============================




    // addConnection(countMap, m.labels)
    // addConnection(countMap.connections, Object.keys(m.properties))
    // addConnection(countMap.connections.connections, Object.values(m.properties))


    m.labels.forEach(function (label) {

      let currentLabel = countMap.labelConnections.find(function (labels) {
        return labels.name == label
      })


      if (!currentLabel) {
        currentLabel = {name: label, type:'label', count: 0, connections: []}
        countMap.labelConnections.push(currentLabel)
      }

      currentLabel.count++


      for (let k in m.properties) {
        
        let currentProperty = currentLabel.connections.find(function (prop) {
          return prop.name == m.properties[k]
        })

        if (!currentProperty) {
          currentProperty = {name: k, type: 'property', count: 0, connections: []}
          currentLabel.connections.push(currentProperty)
        }

        currentProperty.count++

        let propertyValue = currentProperty.connections.find(function (val) {
          return val.name == value
        })

        if (!propertyValue) {
          propertyValue = {name: m.properties[k], type: 'value', count: 0}
          currentProperty.connections.push(propertyValue)
        }

        propertyValue++
      }



      // Object.keys(m.properties).forEach(function (property) {

      //   let currentProperty = currentLabel.connections.find(function (prop) {
      //     return prop.name == property
      //   })

      //   if (!currentProperty) {
      //     currentProperty = {name: property, type: 'property', count: 0, connections: []}
      //     currentLabel.connections.push(currentProperty)
      //   }

      //   currentProperty.count++


      //   Object.values(m.properties).forEach(function (value) {

      //     let propertyValue = currentProperty.connections.find(function (val) {
      //       return val.name == value
      //     })

      //     if (!propertyValue) {
      //       propertyValue = {name: value, type: 'propertyValue', count: 0}
      //       currentProperty.connections.push(propertyValue)
      //     }

      //     propertyValue.count++

      //   })
      // })
    })


    //============================== Counting labels ends ============================

    // Loops through the relationships, counting each one
    for (let k = 0; k < r.length; k++) {
      if (relationshipMap[r[k]] === undefined ) {
        relationshipMap[r[k]] = 0
      }
      relationshipMap[r[k]]++
    }
  }
  (countMap.labelConnections.sort(function(a,b){return a.count - b.count}))
  debugger
  
})

.then(function (result) {
  (countMap)
  let object
  let dates = {}
  let propertyCount = {}

  // Assembles the object
  if (dates[Object.keys(dates)[0]]) {
    object = {
      labels: labelMap,
      relationships: relationshipMap,
      counter: {propertyCount}
    }
  } else {
    object = {
      labels: labelMap,
      relationships: relationshipMap,
      counter: {propertyCount}
    }
  }

  ('==========================================')
  (object)
  ('==========================================')

  // Returns query time and calculation time
  t3 = new Date
  (`Query time: ${t2-t}`)
  (`Calculation time: ${t3-t2}`)
})

  

   