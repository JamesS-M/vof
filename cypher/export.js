//Files
const csvLütteken = '/Users/James/Dropbox/Work/OperaticFame/CSVs/Lütteken/CSV/Reviews.csv'
// const csvLütteken = '/Users/james/Dropbox/Work/OperaticFame/CSVs/Lütteken/CSV/Reviews to be Edited #2.xlsx'
const csvAirtable = '/Users/James/Dropbox/Work/OperaticFame/CSVs/Lütteken/CSV/Calendar_Items.csv'
const csvLüttekenMusikwerk = '/Users/James/Dropbox/Work/OperaticFame/CSVs/Lütteken/CSV/Musikwerk\ Estelle\ adjusted\ May\ 2018.csv';
const csvMap = '/Users/James/Dropbox/Work/OperaticFame/CSVs/Mapping\ CSVs/nameMapping.csv';


//Requires
const csvtojson = require('csvtojson/v1');
const fs = require('fs');

//Neo4j
const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "james"));
const session = driver.session();

//Functions
const functions = require('/Users/james/Documents/GitHub/vof/functions/functions.js')


let map =[];

//Loads nameMapping.csv and pushes each row to a subarray
csvtojson()
.fromFile(csvMap)
.on('csv', (csvRow) => {
  map.push(csvRow);
})


//An array which determines which Lütteken row to select
let musikwerkArr = [];

//Loads csvLütteken file and pushes desired rows into new array
csvtojson()
.fromFile(csvLüttekenMusikwerk)
.on('csv', (csvRow) => {
  if (csvRow[1] == 'x') {
    musikwerkArr.push(csvRow[2]);
  }
})

//Declares an array that will hold Lütteken's data
let lüttekenArr = [];
let keywordsArr = [];

//Loads csvLütteken
csvtojson()
.fromFile(csvLütteken)
.on('csv', (csvRow) => {
  
  //Keywords is used to determine which rows to select
  let keyword = csvRow['Keyword'];

  //Loops through musikwerkArr, selecting jsonObj that matches
  for (let i = 0; i < musikwerkArr.length; i++) {
    for (let j = 0; j < csvRow.length; j++) {
      if (csvRow[j].includes(musikwerkArr[i])) {
        lüttekenArr.push(csvRow);
      }
    }
  }
})

//After Lütteken is loaded and manipulated, exports to neo4j
.on('done', () => {
  console.log('Finished loading Lütteken. Starting export to NEO4J.');
  neo4jLüttekenExport(lüttekenArr); //828 rows 
})

//Declares an array used to hold all of airtable's data
let airtableArr = [];

//Loads csvAirtable and pushes data into a new array
csvtojson()
.fromFile(csvAirtable)
.on('csv', (csvRow) => {
  airtableArr.push(csvRow);
})

//After Airtable is loaded, export to neo4j
.on('done', () => {
  console.log('Finished loading Airtable. Starting export to NEO4J');
  // neo4jAirtableExport(airtableArr);
})



  function neo4jLüttekenExport (lüttekenArr) {
    console.log(lüttekenArr.length+' lütteken rows to process')
    for (let i = 0; i < lüttekenArr.length; i++) {

      let Review = functions.extract_review(lüttekenArr[i][3])
      let Journal = lüttekenArr[i][4]
      let Publication1 = lüttekenArr[i][5]
      let Year = lüttekenArr[i][6]
      let Publication2 = lüttekenArr[i][8]
      let Translated = lüttekenArr[i][11]
      let Ideal_Opera = functions.extract_ideal_opera(lüttekenArr[i][13])


      // let query;


      let query = 'MERGE (m:Journal {Journal:"'+lüttekenArr[i][4]+'", Translated:"'+lüttekenArr[i][11]+'"}) MERGE (n:Person {Critic:"'+functions.name_reorder(lüttekenArr[i][7])+'", Composer:"'+lüttekenArr[i][9]+'", Troupe_Director:"'+lüttekenArr[i][19]+'", Theatre_Director:"'+lüttekenArr[i][20]+'", Performer:"'+lüttekenArr[i][21]+'", Ruler:"'+lüttekenArr[i][22]+'", Aesthetician:"'+lüttekenArr[i][23]+'", Diplomat:"'+lüttekenArr[i][24]+'", Librettist:"'+lüttekenArr[i][25]+'"}) MERGE (b:Review {Review:"'+functions.extract_review(lüttekenArr[i][3])+'", Publication:"'+lüttekenArr[i][5]+', '+lüttekenArr[i][8]+'", Year:"'+lüttekenArr[i][6]+'"}) MERGE (v:Ideal_Opera {Ideal_Opera:"'+functions.extract_ideal_opera(lüttekenArr[i][33])+'"}) MERGE (s:Place {Country: "'+lüttekenArr[i][28]+'", City: "'+functions.extract_name(lüttekenArr[i][27])+'", Court:"'+lüttekenArr[i][29]+'", Theatre: "'+lüttekenArr[i][30]+'"}) MERGE (m)-[:Contains]->(b) MERGE (n)-[:Wrote]-(b) MERGE (b)-[:Review_Of]-(v)';
      console.log(query)
      session
      .run(query)
      .then(function (result) {
        // console.log('Lütteken finished processing row ' + i) ;
      })
    }
    return
  }




  function neo4jAirtableExport (airtableArr) {
    let query;
    console.log(airtableArr.length+' airtable rows to process')

    for (let i = 0; i < airtableArr.length; i++) {
      
      let Ideal_Opera = airtableArr[i][2]
      let Alternate_Title = airtableArr[i][3]
      let Composer = airtableArr[i][4]
      let Performance_Language = airtableArr[i][5]
      let Performance_Date = airtableArr[i][6]
      let Genre = airtableArr[i][7]
      let Troupe = airtableArr[i][8]
      let Place = airtableArr[i][9]
      let Latitude = airtableArr[i][10]
      let Longitude = airtableArr[i][11]
      let Theatre_Journal = airtableArr[i][12]
      let Theatre_Page = airtableArr[i][13]
      let Secondary_Source = airtableArr[i][14]
      let Secondary_Source_Page = airtableArr[i][15]

      if (Theatre_Journal != '') {
        query = 'MERGE (x:Ideal_Opera {Ideal_Opera:"'+Ideal_Opera+'"}) MERGE (m:Opera_Performance {Original_Title: "'+Ideal_Opera+'", Alternate_Title: "'+Alternate_Title+'", Date: "'+Performance_Date+'", Language: "'+Performance_Language+'"}) MERGE (n:Journal {Journal: "'+Theatre_Journal+'", Page: "'+Theatre_Page+'"}) MERGE (b:Person {Composer:"'+Composer+'"}) MERGE (v:Troupe {Troupe: "'+Troupe+'"}) MERGE (c:Place {City: "'+Place+'"}) MERGE (b)-[:Wrote]->(x) MERGE (m)-[:Performed_In]->(c) MERGE (m)-[:Performed_By]->(v) MERGE (n)-[:References]->(m) MERGE (m)-[:Performance_Of]-(x)';
      } else {
        query = 'MERGE (x:Ideal_Opera {Ideal_Opera: "'+Ideal_Opera+'"}) MERGE (m:Opera_Performance {Original_Title: "'+Ideal_Opera+'", Alternate_Title: "'+Alternate_Title+'", Date: "'+Performance_Date+'", Language: "'+Performance_Language+'"}) MERGE (n:Secondary_Source {Secondary_Source: "'+Secondary_Source+'", Page: "'+Secondary_Source_Page+'"}) MERGE (b:Person {Composer: "'+Composer+'"}) MERGE (v:Troupe {Troupe: "'+Troupe+'"}) MERGE (c:Place {City: "'+Place+'"}) MERGE (b)-[:Wrote]->(x) MERGE (m)-[:Performed_In]->(c) MERGE (m)-[:Performed_By]->(v) MERGE (n)-[:References]->(m) MERGE (m)-[:Performance_Of]-(x)';
      }
      session
      .run(query)
      .then(function (result) {
        console.log('Airtable finished processing row ' + i);
      })
    }
    return;
  }

