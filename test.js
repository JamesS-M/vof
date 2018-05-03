var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://neo4j:neo4j@localhost:11002');

db.cypher({
  query: 'MATCH (n:Composer) RETURN n LIMIT 25',
  params: {}
}, function(err, results) {
  if (err) throw err;
  var result = results[0];
  if (!result) {
    console.log('No results found.');
  } else {
    var Composer = result['n'];
    console.log(JSON.stringify(Composer, null, 4))
  }
})