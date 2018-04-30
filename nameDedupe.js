const LüttekenCSV='/Users/James/Documents/NEO4J/Folder/Input/Reviews.csv'
const AirtableCSV='/Users/James/Downloads/Composers-Gridview.csv'

const csvtojson=require('csvtojson')
const fs = require('fs')
const Json2csvParser=require('json2csv').Parser;
const parseFullName = require('parse-full-name').parseFullName;

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
                    "Vergleich Oper/Drama"]

//Removes '<' and '>' form input and returns array of cleaned data. If input doesn't have '<, >', pushes into array
//without modifying.
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

function extractKeyword(dirtyKeyword) {
  let cleanKeyword = [];
  if (dirtyKeyword.charAt(0) === '<') {
    let pattern = /<(.*?)>/g;
    while(matches = pattern.exec(dirtyKeyword)) {
      cleanKeyword.push(matches[1]);
    }
  } else if (dirtyKeyword.charAt(0) === ''){
  } else {
    cleanKeyword.push(dirtyKeyword)
  }
  return cleanKeyword
}

let lüttekenNames = [];
let airtableNames = [];
let combinedNames = [];

csvtojson()
.fromFile(LüttekenCSV)
.on('json', (jsonObj, rowIndex) => {
  //Cleans person and people columns from csv using extractName function
  let person = extractName(jsonObj['Person']);
  let people = extractName(jsonObj['People']);
  
  //Concatenates arrays
  let concatArray = Array.from(new Set(people.concat(person)))
  let newArray = [];
  let finalArray = [];

//Combines different parts of name to create formattedName
let formattedName = [];
for (let i = 0; i < concatArray.length; i++) {
  firstName = parseFullName(concatArray[i], 'first');
  middleName = parseFullName(concatArray[i], 'middle');
  nickName = parseFullName(concatArray[i], 'nick')
  lastName = parseFullName(concatArray[i], 'last');

  //Combines desired aspects of names together into array
  formattedName.push(firstName + ' ' + middleName + ' ' + nickName + ' ' + lastName);
}
  
let finalName =[];

//Removes multiple spaces from names. Pushes results into finalName
formattedName.forEach(spaceRemover = (name) => {
  let pattern = / +/g;
  finalName.push(name.replace(/ +/gi, ' '))
  // console.log(finalName)
})

let seperatedKeyword =  extractKeyword(jsonObj['Keyword'])
// console.log(seperatedKeyword)

let finalKeywords = [];

//Loops through knownKeywords (22 times)
for (let i = 0; i < knownKeywords.length; i++) {
  /*Loops through seperatedKeyword from jsonObj, returning only rows which
  contain knownKeywords */
  for (let j = 0; j < seperatedKeyword.length; j++) {
    if (seperatedKeyword[j].includes(knownKeywords[i])) {
      finalKeywords.push(seperatedKeyword[j])
    }
  }
}

//Outputs the formatted names whose keywords match knownKeywords
for (let i = 0; i < finalKeywords.length; i++) {
  // let lüttekenNames = [];
  if (finalKeywords[i] && finalName[i]) {
  lüttekenNames.push(finalName)
  // console.log(rowIndex + ' ' + lüttekenNames)
  // console.log(lüttekenNames)  
  }
}
})

csvtojson()
.fromFile(AirtableCSV)
.on('json', (jsonObj, rowIndex) => {
  // console.log(rowIndex + ' ' + extractNameQuotes(jsonObj['Name']));
  airtableNames.push(extractNameQuotes(jsonObj['Name']))
  // console.log(rowIndex + ' ' + airtableNames)
})
.on('done', () => {
  
  for (let i = 0; i < airtableNames.length; i++) {
    // console.log('Searching for:' + airtableNames[i])
    for (let j = 0; j < lüttekenNames.length; j++) {
      if (lüttekenNames[j].includes(airtableNames[i])) {
        combinedNames.push(lüttekenNames)
      }
      
    }
  }
  console.log(combinedNames)
})