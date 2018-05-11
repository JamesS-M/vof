const csvLütteken = '/Users/James/Documents/CS/OperaticFame/Folder/Input/Lütteken/Reviews.csv'
const csvAirtable = '/Users/James/Documents/CS/OperaticFame/Folder/Input/csv/Calendar_Items.csv'
const csvLüttekenMusikwerk = '/Users/James/Documents/CS/OperaticFame/Folder/Input/Lütteken/Musikwerk\ Estelle\ adjusted\ May\ 2018.csv';
const csvMap = '/Users/James/Documents/CS/OperaticFame/Folder/Mapping\ CSVs/nameMapping.csv';

const csvtojson=require('csvtojson');
const fs = require('fs');
const Json2csvParser=require('json2csv').Parser;

var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "james"));
var session = driver.session();
function serverStop(){
  session.close();
}

let knownKeywords = ["Englische Oper (Gattung)",
                    "Französische Oper (Gattung)",
                    "Italienische Oper (Gattung)",
                    "Oper (Gattung)",
                    "Oper (Veranstaltung)",
                    "Oper, Libretto",
                    "Oper, Stoffe",
                    "Opera buffa",
                    "Opéra comique (Gattung)",
                    "Opera seria",
                    "Operette",
                    "Opernhäuser/haus",
                    "Opernpraxis",
                    "Opernsänger/innen",
                    "Publikum, Oper",
                    "Querelle des Bouffons",
                    "Querelle des Gluckistes et des Piccinistes",
                    "Querelle des Italiens...",
                    "Singspiel",
                    "Theatertruppen",
                    "Tragédie lyrique",
                    "Vergleich Oper/Drama",
                    "Melodram"];

/* Removes '<' and '>' from input and returns array of cleaned data. If input doesn't
have '<, >', pushes into array without modifying */
function extractName(manynames) {
  let cleanNames = [];
  if (manynames.charAt(0) === '<') {
    let pattern = /<(.*?)>/g;
    while(matches = pattern.exec(manynames)) {
      cleanNames.push(matches[1]);
    }
  } else if (manynames.charAt(0) === ''){
  } else {
    cleanNames.push(manynames);
  }
  return cleanNames;
}

//Extracts the name of the opera
function extractOpera(opera) {
  let cleanOperas = [];
  if(opera.charAt(0) === '<') {
    let pattern = /<.*?: (.*?)( \(\d\d\d\d\))?>/g;
    while(matches = pattern.exec(opera)) {
      cleanOperas.push(matches[1]);
    
    } 
  } else {
    cleanOperas.push(opera);
  }
  return cleanOperas;
}

//Inputs name from airtable||Lütteken and returns canonical name. If '', returns unknown
let canonIt = (name) => {
  if (name != ''){
    for (let a = 0; a < map.length; a++) {
      if (map[a].includes(name)) {
        return map[a][0];
      }
    }  
  } else {
    return 'unknown';
  }
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

//Exports info from Airtable into neo4j. Creates nodes and relationships
function neo4jAirtableExport(airtableArr) {
  let query;
  for (let i = 0; i < airtableArr.length; i++) {
    if (airtableArr[i][11] == '') {
      if (airtableArr[i][13] == 'French Opera') {
      query = 'MERGE (x:Ideal_Opera {Ideal_Opera:"'+extractNameQuotes(airtableArr[i][1])+'", Genre:"'+airtableArr[i][13]+'"}) MERGE (m:Opera_Performance {Original_Title: "'+extractNameQuotes(airtableArr[i][1])+'", Alternate_Title: "'+airtableArr[i][2]+'", Date: "'+formatDate(airtableArr[i][5])+'", Language: "'+airtableArr[i][3]+'"}) MERGE (n:Journal {Journal: "'+airtableArr[i][8]+'", Page: "'+airtableArr[i][9]+'"}) MERGE (b:Person {Composer:"'+extractNameQuotes(airtableArr[i][4])+'"}) MERGE (v:Troupe {Troupe: "'+airtableArr[i][7]+'"}) MERGE (c:Place {City: "'+airtableArr[i][6]+'"}) MERGE (b)-[:Wrote]->(x) MERGE (m)-[:Performed_In]->(c) MERGE (m)-[:Performed_By]->(v) MERGE (n)-[:References]->(m) MERGE (m)-[:Performance_Of]-(x)';
      } else {
        query = 'MERGE (x:Ideal_Opera {Ideal_Opera:"'+extractNameQuotes(airtableArr[i][1])+'"}) MERGE (m:Opera_Performance {Original_Title: "'+extractNameQuotes(airtableArr[i][1])+'", Alternate_Title: "'+airtableArr[i][2]+'", Date: "'+formatDate(airtableArr[i][5])+'", Language: "'+airtableArr[i][3]+'"}) MERGE (n:Journal {Journal: "'+airtableArr[i][8]+'", Page: "'+airtableArr[i][9]+'"}) MERGE (b:Person {Composer:"'+extractNameQuotes(airtableArr[i][4])+'"}) MERGE (v:Troupe {Troupe: "'+airtableArr[i][7]+'"}) MERGE (c:Place {City: "'+airtableArr[i][6]+'"}) MERGE (b)-[:Wrote]->(x) MERGE (m)-[:Performed_In]->(c) MERGE (m)-[:Performed_By]->(v) MERGE (n)-[:References]->(m) MERGE (m)-[:Performance_Of]-(x)';}
    } else {
      if (airtableArr[i][13] == 'French Opera') {
      query = 'MERGE (x:Ideal_Opera {Ideal_Opera: "'+extractNameQuotes(airtableArr[i][1])+'", Genre:"'+airtableArr[i][13]+'"}) MERGE (m:Opera_Performance {Original_Title: "'+extractNameQuotes(airtableArr[i][1])+'", Alternate_Title: "'+airtableArr[i][2]+'", Date: "'+formatDate(airtableArr[i][5])+'", Language: "'+airtableArr[i][3]+'"}) MERGE (n:Secondary_Source {Secondary_Source: "'+airtableArr[i][11]+'", Page: "'+airtableArr[i][12]+'"}) MERGE (b:Person {Composer: "'+extractNameQuotes(airtableArr[i][4])+'"}) MERGE (v:Troupe {Troupe: "'+airtableArr[i][8]+'"}) MERGE (c:Place {City: "'+airtableArr[i][7]+'"}) MERGE (b)-[:Wrote]->(x) MERGE (m)-[:Performed_In]->(c) MERGE (m)-[:Performed_By]->(v) MERGE (n)-[:References]->(m) MERGE (m)-[:Performance_Of]-(x)';
      } else {
        query = 'MERGE (x:Ideal_Opera {Ideal_Opera: "'+extractNameQuotes(airtableArr[i][1])+'"}) MERGE (m:Opera_Performance {Original_Title: "'+extractNameQuotes(airtableArr[i][1])+'", Alternate_Title: "'+airtableArr[i][2]+'", Date: "'+formatDate(airtableArr[i][5])+'", Language: "'+airtableArr[i][3]+'"}) MERGE (n:Secondary_Source {Secondary_Source: "'+airtableArr[i][11]+'", Page: "'+airtableArr[i][12]+'"}) MERGE (b:Person {Composer: "'+extractNameQuotes(airtableArr[i][4])+'"}) MERGE (v:Troupe {Troupe: "'+airtableArr[i][8]+'"}) MERGE (c:Place {City: "'+airtableArr[i][7]+'"}) MERGE (b)-[:Wrote]->(x) MERGE (m)-[:Performed_In]->(c) MERGE (m)-[:Performed_By]->(v) MERGE (n)-[:References]->(m) MERGE (m)-[:Performance_Of]-(x)';
    }
    }
    session
    .run(query)
    .then(function (result) {
      console.log('Airtable finished processing row ' + i);
    })
  }
session.close();  
return;
}

//Exports info from Lütteken into neo4j 
function neo4jLüttekenExport(lüttekenArr) {
  let query;
  for (let i = 0; i < lüttekenArr.length; i++) {
    if (lüttekenArr[i][18] == '') {
      query = 'MERGE (m:Journal {Journal:"'+lüttekenArr[i][4]+'", Translated:"'+lüttekenArr[i][11]+'"}) MERGE (n:Person {Critic:"'+reorderName(lüttekenArr[i][7])+'", Composer:"'+lüttekenArr[i][9]+'", Troupe_Director:"'+lüttekenArr[i][19]+'", Theatre_Director:"'+lüttekenArr[i][20]+'", Performer:"'+lüttekenArr[i][21]+'", Ruler:"'+lüttekenArr[i][22]+'", Aesthetician:"'+lüttekenArr[i][23]+'", Diplomat:"'+lüttekenArr[i][24]+'", Librettist:"'+lüttekenArr[i][25]+'"}) MERGE (b:Review {Review:"'+extractReview(lüttekenArr[i][3])+'", Publication:"'+lüttekenArr[i][5]+', '+lüttekenArr[i][8]+'", Year:"'+lüttekenArr[i][6]+'"}) MERGE (v:Ideal_Opera {Ideal_Opera:"'+extractIdealOpera(lüttekenArr[i][33])+'"}) MERGE (s:Place {Country: "'+lüttekenArr[i][28]+'", City: "'+extractName(lüttekenArr[i][27])+'", Court:"'+lüttekenArr[i][29]+'", Theatre: "'+lüttekenArr[i][30]+'"}) MERGE (m)-[:Contains]->(b) MERGE (n)-[:Wrote]-(b) MERGE (b)-[:Review_Of]-(v)';
    } else {
      query = 'MERGE (m:Journal {Journal:"'+lüttekenArr[i][4]+'", Translated:"'+lüttekenArr[i][11]+'"}) MERGE (n:Person {Critic:"'+reorderName(lüttekenArr[i][7])+'", Composer:"'+lüttekenArr[i][9]+'", Troupe_Director:"'+lüttekenArr[i][19]+'", Theatre_Director:"'+lüttekenArr[i][20]+'", Performer:"'+lüttekenArr[i][21]+'", Ruler:"'+lüttekenArr[i][22]+'", Aesthetician:"'+lüttekenArr[i][23]+'", Diplomat:"'+lüttekenArr[i][24]+'", Librettist:"'+lüttekenArr[i][25]+'"}) MERGE (b:Review {Review:"'+extractReview(lüttekenArr[i][3])+'", Publication:"'+lüttekenArr[i][5]+', '+lüttekenArr[i][8]+'", Year:"'+lüttekenArr[i][6]+'"}) MERGE (v:Ideal_Opera {Ideal_Opera:"'+extractIdealOpera(lüttekenArr[i][33])+'"}) MERGE (s:Place {Country: "'+lüttekenArr[i][28]+'", City: "'+extractName(lüttekenArr[i][27])+'", Court:"'+lüttekenArr[i][29]+'", Theatre: "'+lüttekenArr[i][30]+'"}) MERGE (m)-[:Contains]->(b) MERGE (n)-[:Wrote]-(b) MERGE (b)-[:Review_Of]-(v)';
    }
    session
    .run(query)
    .then(function (result) {
      console.log('Lütteken finished processing row ' + i) ;
      session.close();
    })
  }

return;
}

//Re-orders Lütteken names to be in Airtable format(firstName lastName)
function reorderName(name) {
  let str = name.toString();
  let regex = /,/;
  if (regex.test(str)) {
    let result = str.split(", ");
    if (result[1]) {
    return result[1].substr(0,result[1].length) + ' ' + result[0];
    } else {
      return result[0];
    }
  } else {
    return str;
  }
}

//Removes quotation marks
function extractNameQuotes(manynames) {
  let cleanNames = [];
  switch(manynames.charAt(0)) {
    case '\"':
    cleanNames.push(manynames.substring(1, manynames.length - 1));
    break;
    default:
    cleanNames.push(manynames);
  }
  return cleanNames;
}

//Extracts review title
function extractReview(review) {
  let cleanReview = [];
  let pattern = /: \[?(.*?)\]?$/
  let match = pattern.exec(review)
  return match[1]
}

//Extracts ideal opera title
let extractIdealOpera = (opera) => {
  let cleanOpera = [];
  let pattern = /: (.*?)[\.-\>]/
  while(matches = pattern.exec(opera)) {
    cleanOpera.push(matches[1]);
    return cleanOpera;
  }
}

//Flattens arrays
var flatten = function(a, shallow,r){
  if(!r){ r = []} 
if (shallow) {
  return r.concat.apply(r,a);
  }
   for(var i=0; i<a.length; i++){
        if(a[i].constructor == Array){
            flatten(a[i],shallow,r);
        }else{
            r.push(a[i]);
        }
    }
    return r;
}

//Makes sure connection to neo4j is not running before running following scripts
serverStop();

//map will hold the subarrays for name mapping
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
  neo4jAirtableExport(airtableArr); //9126 rows  
})