var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "james"));
var session = driver.session()

let query = 'MATCH(n)-[r]-(m) where id(n)=139443 return keys(m), n,m,r'

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




session
.run(query)
  .then(function (result) {
    driver.close()
    t2 = new Date
    for (var i = 0; i < result.records.length; i++) {
      //receiving data
      relationships.push(result.records[i].toObject().r.type)
      m_labels.push(result.records[i].toObject().m.labels.toString())
      // console.log(result.records[i])
    }
    //counting relationships
    for (var i = 0; i < relationships.length; i++) {
      switch (relationships[i]) {
        case 'Performed_By':
          performed_by++
          break;
        case 'References':
          references++
          break;
        case 'Performance_Of':
          performance_of++
          break;
        case 'Performed_In':
          performed_in++
          break;
        case 'Wrote':
          wrote++
          break;
        default:
      }
    }
    //counting labels
    for (var i = 0; i < m_labels.length; i++) {
      switch (m_labels[i]) {
        case 'Opera_Performance':
          opera_performance++
          break;
        case 'Journal':
          journal++
          break;
        case 'Ideal_Opera':
          ideal_opera++
          break;
        case 'Place':
          place++
          break;
        case 'Troupe':
          troupe++
          break;
        default:
      }
    }

    //assembling object
    let count = {
      'Relationships': relationships.length,
      'Connected_Labels': m_labels.length,
      'Performed_By': performed_by,
      'References': references,
      'Performance_Of': performance_of,
      'Performed_In': performed_in,
      'Wrote': wrote,
      'Opera_Performance': opera_performance,
      'Journal': journal,
      'Ideal_Opera': ideal_opera,
      'Place': place,
      'Troupe': troupe
    }
    let object = {
      node: 'Node Name',
      relationships: [{
        Performed_In: performed_in,
        References: references,
        Performance_Of: performance_of,
        Performed_By: performed_by,
        Wrote: wrote
      }],
      labels: [{
        Opera_Performance: opera_performance,
        Journal: journal,
        Ideal_Opera: ideal_opera,
        Place: place,
        Troupe: troupe
      }]
    }
    // console.log(count)
    console.log(object)
    t3 = new Date
    console.log('Query time:')
    console.log(t2-t)
    console.log('Calculation time:')
    console.log(t3-t2)
  })  
