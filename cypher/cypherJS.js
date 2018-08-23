var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "james"));
// var driver = neo4j.driver("bolt://hobby-kapooclnoaicgbkepnkkcnbl.dbs.graphenedb.com:24786", neo4j.auth.basic("james", "b.7Vv42A3Qt3Z8.fgeqtr3c9iEk2R15"))
var session = driver.session();

let query = 'match (n)-[r]-(m)  return n,r'

session
    .run(query)
    .then(function (result) {
      // console.log(result.records[0])
      // console.log(result.records[0].toObject().n.identity)
      // console.log(result.records[0].toObject().n.labels)
      // console.log(result.records[0].toObject().n.properties)
      // console.log(result.records[0].toObject().r)
      let nodes = []
      let edges = []
      for (let i = 0; i < result.records.length; i++){

      console.log(result.records[i])
      console.log(result.records[i].toObject().n.identity)
      console.log(result.records[i].toObject().n.labels)
      console.log(result.records[i].toObject().n.properties)
      console.log(result.records[i].toObject().r)
      console.log('-----------------------------------')      
    }
    driver.close()
  })
