var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "james"));
var session = driver.session()


function count() {
  session
  .run('Match (n) return count(n)')
  .then(function (result) {
    console.log(result.summary)
    console.log('Completed in ' + result.summary.resultAvailableAfter + 'ms')
  })  
}

function call () {
  
  count()
}

call()