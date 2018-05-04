var cypher = require('cypher-stream')('bolt://localhost:7687', 'neo4j', 'james');
var should = require('should');
const csvFile = '/Users/James/Documents/CS/OperaticFame/Folder/Input/csv/Calendar_Items.csv'
const csv=require('csvtojson')
const fs = require('fs')

let jsonCatch1 = [];

csv()
.fromFile(csvFile)
.on('json', (jsonObj, rowIndex) => {
	
	
		let query = 'MERGE (n:Composer{Composer: "' + jsonObj.Composer + '"}) MERGE (m:Opera{Opera: "' + jsonObj.Opera + '", Language: "' + jsonObj.Language + '"}) MERGE (b:Troupe {Troupe: "' + jsonObj.Troupe + '"}) MERGE (v:Place {Place: "' + jsonObj.Place + '"}) MERGE (c:Performance {Performance_Date: "' + jsonObj.Performance_Date + '", Performance_Date_ISO: "' + jsonObj.Performance_Date_ISO + '", Troupe: "' + jsonObj.Troupe + '", Place: "' + jsonObj.Place + '"})'
		setTimeout(cypher(query)
		.on('data', function(result, err) {
			if(err) {
				jsonCatch1.push(jsonObj)
			}
		}), 500)
		.on('end', function() {
			console.log(rowIndex + ' - Imported: ' + jsonObj.Opera + ' and attributes')
		})
})



.on('done', () =>{
// 	for (let i = 0; i < jsonCatch1.length; i++){
// 		let query = 'MERGE (n:Composer{Composer: "' + jsonCatch1[i].Composer + '"}) MERGE (m:Opera{Opera: "' + jsonCatch1[i].Opera + '", Language: "' + jsonCatch1[i].Language + '"}) MERGE (b:Troupe {Troupe: "' + jsonCatch1[i].Troupe + '"}) MERGE (v:Place {Place: "' + jsonCatch1[i].Place + '"}) MERGE (c:Performance {Performance_Date: "' + jsonCatch1[i].Performance_Date + '", Performance_Date_ISO: "' + jsonCatch1[i].Performance_Date_ISO + '", Troupe: "' + jsonCatch1[i].Troupe + '", Place: "' + jsonCatch1[i].Place + '"})'
// 		cypher(query)
// 		.on('data', function(result) {
// 			console.log(result)
// 		})
// 		.on('end', function() {
// 			console.log('Finished import, check Neo4j')
// 		})
// 	}
console.log('jsonCatch1')
})