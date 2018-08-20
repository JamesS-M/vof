var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "james"));
var session = driver.session()

let query = 'MATCH(n)-[r]-(m) where id(n)=75 return keys(m), n,m,r'

let relationships = [];
let performed_by = 0;
let references = 0;
let performance_of = 0;
let performed_in = 0;
let wrote = 0;

let m_labels = [];
let opera_performance = 0;
let journal = 0;
let ideal_opera = 0;
let place = 0;
let troupe = 0;

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
})

.then(function (result) {
  let object = {
    labelMap,
    relationshipMap
  }

  console.log(object)
  t3 = new Date
  console.log('Query time:')
  console.log(t2-t)
  console.log('Calculation time:')
  console.log(t3-t2)

})

  

   