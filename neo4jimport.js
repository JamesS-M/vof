var cypher = require('cypher-stream')('bolt://localhost:7687', 'neo4j', 'james');
const csvFile = '/Users/James/Documents/CS/OperaticFame/Folder/Input/csv/Calendar_Items.csv'
const csv=require('csvtojson')
const fs = require('fs')

let JSON = [];

csv()
.fromFile(csvFile)
.on('json', (jsonObj, rowIndex) => {
	JSON.push(jsonObj)
})

.on('done', () =>{
	for (let i = 0; i < JSON.length; i++){
		let query = 'MERGE (n:Composer{Composer: "' + JSON[i].Composer + '"}) MERGE (m:Opera{Opera: "' + JSON[i].Opera + '", Language: "' + JSON[i].Language + '"}) MERGE (b:Troupe {Troupe: "' + JSON[i].Troupe + '"}) MERGE (v:Place {Place: "' + JSON[i].Place + '"}) MERGE (c:Performance {Performance_Date: "' + JSON[i].Performance_Date + '", Performance_Date_ISO: "' + JSON[i].Performance_Date_ISO + '", Troupe: "' + JSON[i].Troupe + '", Place: "' + JSON[i].Place + '"})'
		cypher(query)
		.on('data', function(result) {
			console.log(result)
		})
		.on('end', function() {
			console.log('Finished import, check Neo4j')
		})
	}
})