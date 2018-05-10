var cypher = require('cypher-stream')('bolt://localhost:7687', 'neo4j', 'james');

let queries = ["match (n:Composer) return n", "match (n:Critic) return n"]
let transaction = cypher.transaction()

cypher(transaction)
  .on('data', function (result){
    console.log(result.n);
  })
  .on('end', function() {
    console.log('all done');
  })
console.log("done the script")