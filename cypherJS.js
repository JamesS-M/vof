var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "james"));
var session = driver.session();

let query = "match (n:Ideal_Opera)-[r]-(m:Opera_Performance)-[w]-(b:Place) return n,m,r,w,b"

session
    .run(query)
    .then(function (result) {
      let nodes = []
      let edges = []
      for (let i = 0; i < 100; i++){
        // nodes.push('{id: '+result.records[i].toObject().n.identity.low+', '+ '\"label\": ' + result.records[i].toObject().n.properties.Ideal_Opera)
        // nodes.push('{id: '+result.records[i].toObject().m.identity.low+', '+ '\"label\": "' + result.records[i].toObject().m.properties.Date + '"')
        nodes.push('{id: '+result.records[i].toObject().b.identity.low+', '+ '\"label\": "' + result.records[i].toObject().b.properties.City + '"')
        // edges.push('{\"from\": ' + result.records[i].toObject().r.start.low + ', \"to\": ' + result.records[i].toObject().r.end+'}')
        edges.push('{\"from\": ' + result.records[i].toObject().w.start.low + ', \"to\": ' + result.records[i].toObject().w.end+'}')

      
      // console.log(nodes)
      console.log(edges)
      driver.close()

      // ... set up the vis.js visualisation
    }
  })
    