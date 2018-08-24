//Files
// const csvLütteken = '/Users/James/Dropbox/Work/OperaticFame/CSVs/Lütteken/CSV/Reviews.csv'
const csvLütteken = '/Users/james/Dropbox/Work/OperaticFame/CSVs\ Backup/Lütteken/CSV/Edited\ Reviews.csv'
const csvAirtable = '/Users/James/Dropbox/Work/OperaticFame/CSVs\ Backup/Lütteken/CSV/Calendar_Items.csv'
const csvLüttekenMusikwerk = '/Users/James/Dropbox/Work/OperaticFame/CSVs\ Backup/Lütteken/CSV/Musikwerk\ Estelle\ adjusted\ May\ 2018.csv';
const csvMap = '/Users/James/Dropbox/Work/OperaticFame/CSVs\ Backup/Mapping\ CSVs/nameMapping.csv';

//Requires
const csvtojson = require('csvtojson/v1');
const fs = require('fs');

//Neo4j
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "james"));
const session = driver.session();

//Functions
const functions = require('../functions/functions.js')


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
  neo4jLüttekenExport(lüttekenArr); //1992 rows
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
  // neo4jAirtableExport(airtableArr); //13591 rows
})



  function neo4jLüttekenExport (lüttekenArr) {
    console.log(lüttekenArr.length+' lütteken rows to process')
    for (let i = 0; i < lüttekenArr.length; i++) {

      //Publications
      let Review = functions.extract_review(lüttekenArr[i][3])
      let Journal = lüttekenArr[i][4]
      let Publication_1 = lüttekenArr[i][5]
      let Year = lüttekenArr[i][6]
      let Publication_2 = lüttekenArr[i][8]
      let Translated = lüttekenArr[i][11]

      //Opera
      let Ideal_Opera = functions.extract_ideal_opera(lüttekenArr[i][36])

      //People
      let Person = functions.name_reorder(functions.extract_name(lüttekenArr[i][17]))
      let Composer = functions.name_reorder(lüttekenArr[i][18])
      let Theatre_Director = functions.name_reorder(lüttekenArr[i][20])
      let Performer = functions.name_reorder(lüttekenArr[i][21])
      let Ruler = functions.name_reorder(lüttekenArr[i][22])
      let Aesthetician = functions.name_reorder(lüttekenArr[i][23])
      let Critic = functions.name_reorder(lüttekenArr[i][24])
      let Impresario = functions.name_reorder(lüttekenArr[i][25])
      let Saint = functions.name_reorder(lüttekenArr[i][26])
      let Diplomat = functions.name_reorder(lüttekenArr[i][27])
      let Librettist = functions.name_reorder(lüttekenArr[i][28])

      //Place
      let Country = lüttekenArr[i][31]
      let City = lüttekenArr[i][34]
      let Theatre = functions.extract_theatre(lüttekenArr[i][40])


      let queryJournal
      let queryReview
      let queryOpera
      let queryPerson
      let queryPlace

      let queryRels

      let relsPerson
      let relsPlace
      let relsPublication


      if (Person != '') {
        Person = Person
      } else if (Composer != '') {
        Person = Composer
      } else if (Theatre_Director != '') {
        Person = Theatre_Director
      } else if (Performer != '') {
        Person = Performer
      } else if (Ruler != '') {
        Person = Ruler
      } else if (Aesthetician != '') {
        Person  = Aesthetician
      } else if (Critic != '') {
        Person = Critic
      } else if (Impresario != '') {
        Person = Impresario
      } else if (Saint != '') {
        Person = Saint
      } else if (Diplomat != '') {
        Person  = Diplomat
      } else if (Librettist != '') {
        Person  = librettist
      } else {
        Person = 'No Person'
      }



      //Query Pieces

      //Person
    if (Person != 'No Person') {


      if (Composer != '' && Theatre_Director != '' && Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '' && Diplomat != '' && Librettist != '') {
       queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (composer:Composer {Name:"'+Composer+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) MERGE (librettist:Librettist {Name:"'+Librettist+'"}) '
       relsPerson = 'MERGE (composer)-[:]-() MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() MERGE (librettist)-[:]-()'
      
      } else if (Composer != '' && Theatre_Director != '' && Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '' && Diplomat != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (composer:Composer {Name:"'+Composer+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) '
        relsPerson = 'MERGE (composer)-[:]-() MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() '
      
      } else if (Composer != '' && Theatre_Director != '' && Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (composer:Composer {Name:"'+Composer+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) '
        relsPerson = 'MERGE (composer)-[:]-() MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() ' 
      
      } else if (Composer != '' && Theatre_Director != '' && Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (composer:Composer {Name:"'+Composer+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) '
        relsPerson = 'MERGE (composer)-[:]-() MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() '
      
      } else if (Composer != '' && Theatre_Director != '' && Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (composer:Composer {Name:"'+Composer+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) '
        relsPerson = 'MERGE (composer)-[:]-() MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() '
      
      } else if (Composer != '' && Theatre_Director != '' && Performer != '' && Ruler != '' && Aesthetician != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (composer:Composer {Name:"'+Composer+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) '
        relsPerson = 'MERGE (composer)-[:]-() MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() '
      
      } else if (Composer != '' && Theatre_Director != '' && Performer != '' && Ruler != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (composer:Composer {Name:"'+Composer+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) '
        relsPerson = 'MERGE (composer)-[:]-() MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() '
      
      } else if (Composer != '' && Theatre_Director != '' && Performer != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (composer:Composer {Name:"'+Composer+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) '
        relsPerson = 'MERGE (composer)-[:]-() MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() '
      
      } else if (Composer != '' && Theatre_Director != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (composer:Composer {Name:"'+Composer+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) '
        relsPerson = 'MERGE (composer)-[:]-() MERGE (theatre_director)-[:]-() '
      
      } else if (Composer != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (composer:Composer {Name:"'+Composer+'"}) '
        relsPerson = 'MERGE (composer)-[:]-() '
      
      } else if (Theatre_Director != '' && Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '' && Diplomat != '' && Librettist != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) MERGE (librettist:Librettist {Name:"'+Librettist+'"}) '
        relsPerson = 'MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() MERGE (librettist)-[:]-() '

      } else if (Theatre_Director != '' && Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '' && Diplomat != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) '
        relsPerson = 'MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() '

      } else if (Theatre_Director != '' && Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '' && Saint != ''){
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) '
        relsPerson = 'MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() '

      } else if (Theatre_Director != '' && Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) '
        relsPerson = 'MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() '

      } else if (Theatre_Director != '' && Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) '
        relsPerson = 'MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() '

      } else if (Theatre_Director != '' && Performer != '' && Ruler != '' && Aesthetician != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) '
        relsPerson = 'MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() '

      } else if (Theatre_Director != '' && Performer != '' && Ruler != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) '
        relsPerson = 'MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() MERGE (ruler)-[:]-() '

      } else if (Theatre_Director != '' && Performer != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) '
        relsPerson = 'MERGE (theatre_director)-[:]-() MERGE (performer)-[:]-() '

      } else if (Theatre_Director != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (theatre_director:Theatre_Director {Name:"'+Theatre_Director+'"}) '
        relsPerson = 'MERGE (theatre_director)-[:]-() '

      } else if (Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '' && Diplomat != '' && Librettist != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) MERGE (librettist:Librettist {Name:"'+Librettist+'"}) '
        relsPerson = 'MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() MERGE (librettist)-[:]-() '

      } else if (Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '' && Diplomat != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) '
        relsPerson = 'MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() '

      } else if (Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) '
        relsPerson = 'MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() '

      } else if (Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) '
        relsPerson = 'MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() '

      } else if (Performer != '' && Ruler != '' && Aesthetician != '' && Critic != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) '
        relsPerson = 'MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() '

      } else if (Performer != '' && Ruler != '' && Aesthetician != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) '
        relsPerson = 'MERGE (performer)-[:]-() MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() '

      } else if (Performer != '' && Ruler != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) '
        relsPerson = 'MERGE (performer)-[:]-() MERGE (ruler)-[:]-() '

      } else if (Performer != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (performer:Performer {Name:"'+Performer+'"}) '
        relsPerson = 'MERGE (performer)-[:]-() '

      } else if (Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '' && Diplomat != '' && Librettist != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) MERGE (librettist:Librettist {Name:"'+Librettist+'"}) '
        relsPerson = 'MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() MERGE (librettist)-[:]-() '

      } else if (Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '' && Diplomat != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) '
        relsPerson = 'MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() '

      } else if (Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) '
        relsPerson = 'MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() '

      } else if (Ruler != '' && Aesthetician != '' && Critic != '' && Impresario != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) '
        relsPerson = 'MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() '

      } else if (Ruler != '' && Aesthetician != '' && Critic != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) '
        relsPerson = 'MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() '

      } else if (Ruler != '' && Aesthetician != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) '
        relsPerson = 'MERGE (ruler)-[:]-() MERGE (aesthetician)-[:]-() '

      } else if (Ruler != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (ruler:Ruler {Name:"'+Ruler+'"}) '
        relsPerson = 'MERGE (ruler)-[:]-() '

      } else if (Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '' && Diplomat != '' && Librettist != '') {
         queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) MERGE (librettist:Librettist {Name:"'+Librettist+'"}) '
         relsPerson = 'MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() MERGE (librettist)-[:]-() '

      } else if (Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '' && Diplomat != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) '
        relsPerson = 'MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() '

      } else if (Aesthetician != '' && Critic != '' && Impresario != '' && Saint != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) '
        relsPerson = 'MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() '

      } else if (Aesthetician != '' && Critic != '' && Impresario != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) '
        relsPerson = 'MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() MERGE (impresario)-[:]-() '

      } else if (Aesthetician != '' && Critic != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) '
        relsPerson = 'MERGE (aesthetician)-[:]-() MERGE (critic)-[:]-() '

      } else if (Aesthetician != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (aesthetician:Aesthetician {Name:"'+Aesthetician+'"}) '
        relsPerson = 'MERGE (aesthetician)-[:]-() '

      } else if (Critic != '' && Impresario != '' && Saint != '' && Diplomat != '' && Librettist != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) MERGE (librettist:Librettist {Name:"'+Librettist+'"}) '
        relsPerson = 'MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() MERGE (librettist)-[:]-() '

      } else if (Critic != '' && Impresario != '' && Saint != '' && Diplomat != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) '
        relsPerson = 'MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() '

      } else if (Critic != '' && Impresario != '' && Saint != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) '
        relsPerson = 'MERGE (critic)-[:]-() MERGE (impresario)-[:]-() MERGE (saint)-[:]-() '

      } else if (Critic != '' && Impresario != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) '
        relsPerson = 'MERGE (critic)-[:]-() MERGE (impresario)-[:]-() '

      } else if (Critic != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (critic:Critic {Name:"'+Critic+'"}) '
        relsPerson = 'MERGE (critic)-[:]-() '

      } else if (Impresario != '' && Saint != '' && Diplomat != '' && Librettist != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) MERGE (librettist:Librettist {Name:"'+Librettist+'"})'
        relsPerson = 'MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() MERGE (librettist)-[:]-() '

      } else if (Impresario != '' && Saint != '' && Diplomat != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) '
        relsPerson = 'MERGE (impresario)-[:]-() MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() '

      } else if (Impresario != '' && Saint != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) '
        relsPerson = 'MERGE (impresario)-[:]-() MERGE (saint)-[:]-() '

      } else if (Impresario != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (impresario:Impresario {Name:"'+Impresario+'"}) '
        relsPerson = 'MERGE (impresario)-[:]-() '

      } else if (Saint != '' && Diplomat != '' && Librettist != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) MERGE (librettist:Librettist {Name:"'+Librettist+'"}) '
        relsPerson = 'MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() MERGE (librettist)-[:]-() '

      } else if (Saint != '' && Diplomat != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) '
        relsPerson = 'MERGE (saint)-[:]-() MERGE (diplomat)-[:]-() '

      } else if (Saint != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (saint:Saint {Name:"'+Saint+'"}) '
        relsPerson = 'MERGE (saint)-[:]-() '

      } else if (Diplomat != '' && Librettist != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) MERGE (librettist:Librettist {Name:"'+Librettist+'"}) '
        relsPerson = 'MERGE (diplomat)-[:]-() MERGE (librettist)-[:]-() '

      } else if (Diplomat != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (diplomat:Diplomat {Name:"'+Diplomat+'"}) '
        relsPerson = 'MERGE (diplomat)-[:]-() '

      } else if (Librettist != '') {
        queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (librettist:Librettist {Name:"'+Librettist+'"}) '
        relsPerson =  'MERGE (librettist)-[:]-() '

      } else {
        queryPerson = ''
        relsPerson = ''
      }

    } else { queryPerson = ''
    relsPerson = ''
  }



      //Publications
      if (Publication_2 != '') {
        queryJournal = 'MERGE (journal:Journal {Journal:"'+Journal+'", Continuation:"'+Publication_1+', '+Publication_2+'", Translated:"'+Translated+'"}) '
        relsPublication = 'MERGE (journal)-[:]-() '
      } else {
        queryJournal = 'MERGE (journal:Journal {Journal:"'+Journal+'", Continuation:"'+Publication_1+'", Translated:"'+Translated+'"}) '
        relsPublication = 'MERGE (journal)-[:]-() '
      }

      //Ideal Opera
      if (Ideal_Opera != '') {
        queryOpera = 'MERGE (ideal_opera:Ideal_Opera {Ideal_Opera:"'+Ideal_Opera+'"}) '
        relsOpera = 'MERGE (ideal_opera)-[:]-() '
      } else {
        queryOpera = ''
        relsOpera = ''
      }

      //Country
      if (Country != '' && City != '' && Theatre != '') {
        queryPlace = 'MERGE (place:Place {Country: "'+Country+'", City: "'+City+'", Theater:"'+Theatre+'"}) '
        relsPlace = 'MERGE (place)-[:]-() '

      } else if (Country != '' && City != '') {
        queryPlace = 'MERGE (place:Place {Country: "'+Country+'", City: "'+City+'"}) '
        relsPlace = 'MERGE (place)-[:]-() '

      } else if (Country != '' && Theatre != '') {
        queryPlace = 'MERGE (place:Place {Country: "'+Country+'", Theater:"'+Theatre+'"}) '
        relsPlace = 'MERGE (place)-[:]-() '

      } else if (Country != '') {
        queryPlace = 'MERGE (place:Place {Country: "'+Country+'"}) '
        relsPlace = 'MERGE (place)-[:]-() '

      } else if (City != '' && Theatre != '') {
        queryPlace = 'MERGE (place:Place {City: "'+City+'", Theater:"'+Theatre+'"}) '
        relsPlace = 'MERGE (place)-[:]-() '

      } else if (City != '') {
        queryPlace = 'MERGE (place:Place {City: "'+City+'"}) '
        relsPlace = 'MERGE (place)-[:]-() '

      } else if (Theatre != '') {
        queryPlace = 'MERGE (place:Place {Theater:"'+Theatre+'"}) '
        relsPlace = 'MERGE (place)-[:]-() '

      } else {
        queryPlace = ''
        relsPlace = ''
      }

      //Review
      if (Review != '') {
        queryReview = 'MERGE (review:Review {Review:"'+Review+'", Year:"'+Year+'"}) '
        relsReview = 'MERGE (review)-[:REVIEWS]-() '
      } else {
        queryReview = ''
        relsReview = ''
      }
      
      queryRels = relsReview + relsPlace + relsPerson + relsPublication + relsOpera

      query = queryJournal + queryReview + queryOpera + queryPerson + queryPlace + queryRels

      // console.log(query)
      session
      .run(query)
      .then(function (result) {
        console.log('Lütteken finished processing row ' + i) ;
      })
    }
    return
  }




  function neo4jAirtableExport (airtableArr) {
    let query;
    console.log(airtableArr.length+' airtable rows to process')

    for (let i = 0; i < airtableArr.length; i++) {
      
      //Opera
      let Ideal_Opera = airtableArr[i][2]
      let Alternate_Title = airtableArr[i][3]
      let Performance_Language = airtableArr[i][5]
      let Performance_Date = functions.format_date(airtableArr[i][6])
      let Genre = airtableArr[i][7]
      let Troupe = airtableArr[i][8]

      //People
      let Composer = airtableArr[i][4]
      let Person = airtableArr[i][4]

      //Place
      let Place = airtableArr[i][9]
      let Latitude = airtableArr[i][10]
      let Longitude = airtableArr[i][11]

      //Publications
      let Theatre_Journal = airtableArr[i][12]
      let Theatre_Page = airtableArr[i][13]
      let Secondary_Source = airtableArr[i][14]
      let Secondary_Source_Page = airtableArr[i][15]

      //Query Pieces
      let queryOpera = 'MERGE (ideal_opera:Ideal_Opera {Title:"'+Ideal_Opera+'", Genre:"'+Genre+'"}) '
      let queryPerf = 'MERGE (opera_perf:Opera_Performance {Title: "'+Ideal_Opera+'", Alternate_Title: "'+Alternate_Title+'", Date: "'+Performance_Date+'", Language: "'+Performance_Language+'"}) '
      let queryJournal
      let querySecondSource
      let queryPerson = 'MERGE (person:Person {Name:"'+Person+'"}) MERGE (b:Person {Name:"'+Composer+'"}) '
      let queryComposer = 'MERGE (composer:Composer {Name:"'+Composer+'"}) '
      let queryTroupe = 'MERGE (troupe:Troupe {Name: "'+Troupe+'"}) '
      let queryPlace = 'MERGE (place:Place {City: "'+Place+'", Latitude:"'+Latitude+'", Longitude:"'+Longitude+'"}) '
      let queryRels = 'MERGE (composer)-[:Wrote]->(ideal_opera) MERGE (opera_perf)-[:Performed_In]->(place) MERGE (opera_perf)-[:Performed_By]->(troupe) MERGE (journal)-[:References]->(opera_perf) MERGE (opera_perf)-[:Performance_Of]-(ideal_opera)'

      if (Theatre_Journal != '') {
        queryJournal = 'MERGE (journal:Journal {Title: "'+Theatre_Journal+'", Page: "'+Theatre_Page+'"}) '
      } else {
        queryJournal = 'MERGE (journal:Secondary_Source {Title:"'+Secondary_Source+'", Page:"'+Secondary_Source_Page+'"}) '
      }


      //everyone has a person label, and then different labels for their 'types'(librettist, composer, reviewer, etc.)
      query = queryOpera + queryPerf + queryJournal + queryPerson + queryComposer + queryTroupe + queryPlace + queryRels
      
      session
      .run(query)
      .then(function (result) {
        console.log('Airtable finished processing row ' + i);
      })
    }
    return;
  }