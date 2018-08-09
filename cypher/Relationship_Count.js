var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "james"));
var session = driver.session()

let query = 'MATCH(n)-[r]-(m) where id(n)=40 return n,m,r'

let relationships = [];

session
.run(query)
  .then(function (result) {
    for (var i = 0; i < result.records.length; i++) {
      relationships.push(result.records[i].toObject().r.type)
    }
    for (var i = 0; i < relationships.length; i++) {
      // console.log(relationships[i])
      switch (relationships[i]){
        case 'Performed_By':
          console.log('performance by')
          break;
        case 'References':
          console.log('reference')
          break;
        case 'Performance_Of':
          console.log('performance of')
          break;
        case 'Performed_In':
          console.log('performance in')
          break;
        default:
      }
      driver.close()
    }
  })  