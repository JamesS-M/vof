const csvLütteken = '/Users/James/Documents/CS/OperaticFame/Folder/Input/Lütteken/Reviews.csv'
const csvAirtable = '/Users/James/Documents/CS/OperaticFame/Folder/Input/csv/Calendar_Items.csv'
const csvLüttekenMusikwerk = '/Users/James/Documents/CS/OperaticFame/Folder/Input/Lütteken/Musikwerk\ Estelle\ adjusted\ May\ 2018.csv'
const csvMap = '/Users/James/Documents/CS/OperaticFame/Folder/Mapping\ CSVs/nameMapping.csv'
const csvtojson=require('csvtojson')
const fs = require('fs')
const Json2csvParser=require('json2csv').Parser;
var cypher = require('cypher-stream')('bolt://localhost:7687', 'neo4j', 'james');
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "james"));
var session = driver.session()
function serverStop(){
  session.close()
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
                    "Melodram"]

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
    cleanNames.push(manynames)
  }
  return cleanNames
}

function extractOpera(opera) {
  let cleanOperas = [];
  if(opera.charAt(0) === '<') {
    let pattern = /<.*?: (.*?)( \(\d\d\d\d\))?>/g;
    while(matches = pattern.exec(opera)) {
      cleanOperas.push(matches[1]);
    
    } 
  } else {
    cleanOperas.push(opera)
  }
  return cleanOperas
}

//Inputs name from airtable||Lütteken and returns canonical name. If '', returns unknown
let canonIt = (name) => {
  if (name != ''){
    for (let a = 0; a < map.length; a++) {
      if (map[a].includes(name)) {
        return map[a][0]
      }
    }  
  } else {
    return 'unknown'
  }
}

//Exports airtable to neo4j when secondary source is present
function neo4jAirtableExport(airtableArr) {
  let query;
  for (let i = 0; i < airtableArr.length; i++) {
    if (airtableArr[i][12] != ''){
      query = 'MERGE (m:OperaPerformances {OriginalTitle:"'+airtableArr[i][1]+'", Performance_Date: "'+airtableArr[i][2]+'", Performance_Language:"'+airtableArr[i][3]+'" }) MERGE (b:Secondary_Source {Secondary_Source:"'+airtableArr[i][11]+'", Page: "'+airtableArr[i][12]+'"}) MERGE (v:Composer {Composer:"'+canonIt(airtableArr[i][4])+'"}) MERGE (x:Troupe {Troupe:"'+airtableArr[i][8]+'"}) MERGE (z:Place {Place:"'+airtableArr[i][7]+'"})'
    } else {
      query = 'MERGE (m:OperaPerformances {OriginalTitle:"'+airtableArr[i][1]+'", Performance_Date: "'+airtableArr[i][6]+'", Performance_Language:"'+airtableArr[i][3]+'" }) MERGE (b:Journal {Journal:"'+airtableArr[i][9]+'", Page: "'+airtableArr[i][10]+'"}) MERGE (v:Composer {Composer:"'+canonIt(airtableArr[i][4])+'"}) MERGE (x:Troupe {Troupe:"'+airtableArr[i][8]+'"})MERGE (z:Place {Place:"'+airtableArr[i][7]+'"})'
    }
    session
    .run(query)
    .then(function (result) {
      console.log('Airtable finished ' + i)
    })
  }
session.close();  
return
}
  
function neo4jLüttekenExport(lüttekenArr) {
  for (let i = 0; i < lüttekenArr.length; i++) {
    let query = 'MERGE (m:Journal {Journal:"'+lüttekenArr[i][4]+'"}) MERGE (n:Critic {Critic:"'+lüttekenArr[i][7]+'"}) MERGE (b:Reviews {Review:"'+extractReview(lüttekenArr[i][3])+'", Publication:"'+lüttekenArr[i][5]+', '+lüttekenArr[i][8]+'", Year:"'+lüttekenArr[i][6]+'"}) MERGE (v:Ideal_Opera {Ideal_Opera:"'+extractIdealOpera(lüttekenArr[i][21])+'"})'
    session
    .run(query)
    .then(function (result) {
      console.log('Lütteken finished ' + i)
      session.close()
    })
  }
session.close();
return
}  

//Re-orders Lütteken names to be in Airtable format(firstName lastName)
function reorderName(name) {
  let str = name.toString();
  let regex = /,/
  if (regex.test(str)) {
    let result = str.split(", ");
    if (result[1]) {
    return result[1].substr(0,result[1].length) + ' ' + result[0]
    } else {
      return result[0]
    }
  } else {
    return str
  }
}

//Removes quotation marks
function extractNameQuotes(manynames) {
  let cleanNames = [];
  switch(manynames.charAt(0)) {
    case '\"':
    cleanNames.push(manynames.substring(1, manynames.length - 1))
    break;
    default:
    cleanNames.push(manynames)
  }
  return cleanNames
}

function extractReview(review) {
  let cleanReview = [];
  let pattern = /:(.*\.):.*>/
  while(matches = pattern.exec(review)) {
    cleanReview.push(matches[1]);
    if (matches[1].charAt(0) == '[') {
    return cleanReview
    
    }
    return cleanReview
  }
}

let extractIdealOpera = (opera) => {
  let cleanOpera = [];
  let pattern = /: (.*?)[\.-\>]/
  while(matches = pattern.exec(opera)) {
    cleanOpera.push(matches[1]);
    return cleanOpera
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

//Makes sure connection to neo4j is not running
serverStop()

//map will hold the subarrays for name mapping
let map =[];

//Loads nameMapping.csv and pushes each row to a subarray
csvtojson()
.fromFile(csvMap)
.on('csv', (csvRow) => {
  map.push(csvRow)
})

//An array which determines which Lütteken row to select
let musikwerkArr = [];

csvtojson()
.fromFile(csvLüttekenMusikwerk)
.on('csv', (csvRow) => {
  if (csvRow[1] == 'x') {
    musikwerkArr.push(csvRow[2])
  }
})

//Declares an array that will hold Lütteken's data
let lüttekenArr = []
let keywordsArr = [];
//Loads csvLütteken
csvtojson()
.fromFile(csvLütteken)
.on('csv', (csvRow) => {
  
  //Keywords is used to determine which rows to select
  let keyword = csvRow['Keyword']

  //Loops through musikwerkArr, selecting jsonObj that matches
  for (let i = 0; i < musikwerkArr.length; i++) {
    for (let j = 0; j < csvRow.length; j++) {
      if (csvRow[j].includes(musikwerkArr[i])) {
        lüttekenArr.push(csvRow)
      }
    }
  }
})
  
.on('done', () => {
  console.log('Finished loading Lütteken. Starting export to NEO4J.')
  neo4jLüttekenExport(lüttekenArr) //828 rows 
})

//Declares an array used to hold all of airtable's data
let airtableArr = [];

//Loads csvAirtable
csvtojson()
.fromFile(csvAirtable)
.on('csv', (csvRow) => {
  airtableArr.push(csvRow)
})

.on('done', () => {   
  neo4jAirtableExport(airtableArr) //8850 rows  
  console.log('Finished loading Airtable. Starting export to NEO4J')
})