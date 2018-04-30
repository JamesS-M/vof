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

/* Declares 3 arrays which need to be globally accessible. These arrays will be compared
to each other inside csvtojson()'s .done event */
let lüttekenNames = [];
let airtableNames = [];
let combinedNames = [];

//Loads csv file from Lütteken filepath. Creates jsonObj and rowIndex
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

/* This will be used to push the results of formattedName into after the
excess spaces have been removed */
let finalName =[];

//Removes multiple spaces from names. Pushes results into finalName
formattedName.forEach(spaceRemover = (name) => {
  finalName.push(name.replace(/ +/gi, ' '))
})

//This removes '<' and '>' from the keywords, and saves them as seperatedKeyword
let seperatedKeyword =  extractName(jsonObj['Keyword'])

/* This variable will used to save matching keywords that appear both in our list
of knownKeywords and in the keywords column of the LüttekenCSV */
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

//Loads csv file from AirtableCSV filepath. Creates jsonObj and rowIndex
csvtojson()
.fromFile(AirtableCSV)
.on('json', (jsonObj, rowIndex) => {
  
  //Pushes AirtableCSV's names into airtableNames after removing any quotation marks
  airtableNames.push(extractNameQuotes(jsonObj['Name']))
})

//This runs after the Airtable jsonObj has been loaded and the names have been cleaned up
.on('done', () => {
  
  //Loops through airtableNames
  for (let i = 0; i < airtableNames.length; i++) {
    
    //Loops through lüttekenNames
    for (let j = 0; j < lüttekenNames.length; j++) {
      
      /* If the loop's current value of lüttekenNames includes the loop's current value of
      airtableNames, push those results into combinedNames */
      if (lüttekenNames[j].includes(airtableNames[i])) {
        combinedNames.push(lüttekenNames)
      }
    }
  }
  console.log(combinedNames)
})