var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "james"));
var session = driver.session()

let query = 'MATCH(n)-[r]-(m) where id(n)=11415 return keys(m), n,m,r'

let t = new Date
let t2
let t3

let labelMap = {};
let relationshipMap = {};


session
.run(query)
.then(function (result) {

  driver.close()
  t2 = new Date

  //Loops through the returned records
  for (var i = 0; i < result.records.length; i++) {

    
    // let properties = result.records[i].toObject().m.properties
    // console.log(properties)

    // Assigns variables to a list of the labels and relationships
    let m = result.records[i].toObject().m
    let r = []
    r.push(result.records[i].toObject().r.type)
    let properties = result.records[i].toObject().m.properties
    // console.log(properties)


    for (let l = 0; l < Object.keys(properties).length; l++) {
      // if (properties[l])
      console.log(Object.keys(properties)[l])
      console.log('=====')

    }


    // Loops through the labels, counting each one
    for (let j = 0; j < m.labels.length; j++) {
      if (labelMap[m.labels[j]] === undefined ) {
        labelMap[m.labels[j]] = 0
      }
      labelMap[m.labels[j]]++
    }

    // Loops through the relationships, counting each one
    for (let k = 0; k < r.length; k++) {
      if (relationshipMap[r[k]] === undefined ) {
        relationshipMap[r[k]] = 0
      }
      relationshipMap[r[k]]++
    }
  }
})

.then(function (result) {
  // Assembles the object
  let object = {
    labels: {labelMap},
    relationships: {relationshipMap}
  }

  console.log('==========================================')
  console.log(object)
  debugger

  // Returns query time and calculation time
  t3 = new Date
  console.log('Query time:')
  console.log(t2-t)
  console.log('Calculation time:')
  console.log(t3-t2)

})

  

   