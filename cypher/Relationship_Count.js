var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "james"));
var session = driver.session()

let query = 'MATCH(n)-[r]-(m) return keys(m), n,m,r'

let objects = []; 

 
let t = new Date
let t2
let t3

let properties = [];

session
.run(query)
  .then(function (result) {
    driver.close()
    t2 = new Date
    let labelMap = {};
    let relationshipMap = {};
    for (var j = 0; j < result.records.length; j++) {
      // console.log(result.records[j].toObject().n)
    }
    for (var i = 0; i < result.records.length; i++) {

      let m = result.records[i].toObject().m
      let r = []
      r.push(result.records[i].toObject().r.type)

      for (let j = 0; j < m.labels.length; j++) {
        if (labelMap[m.labels[j]] === undefined ) {
          labelMap[m.labels[j]] = 0
        }
        labelMap[m.labels[j]]++
      }

      for (let k = 0; k < r.length; k++) {
        if (relationshipMap[r[k]] === undefined ) {
          relationshipMap[r[k]] = 0
        }
        relationshipMap[r[k]]++
      }
    }
    // console.log(labelMap)
    // console.log(relationshipMap)

    let object = {
      labelMap,
      relationshipMap
    }

    t3 = new Date
    // console.log(count)
    console.log(object)    
    console.log(`Query time: ${t2-t} ms`)
    console.log(`Calculation time: ${t3-t2} ms`)
  })



// for (records.length) {
//   n[i] = {
//     labels: labelMap,
//     relationships: relationshipMap
//   }
// }










