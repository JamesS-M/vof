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

//Re-orders Lütteken names to be in Airtable format(firstName lastName)
function redoName(name) {
  let str = name.toString();
  let regex = /\,/
  if (regex.test(str)) {
    var res = str.split(", ");
    if (res[1]) {
    return res[1].substr(0,res[1].length) + ' ' + res[0];
    } else {
      return res[0]
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
  formattedName.push(redoName(concatArray[i]))
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

  //Converts airtableNames and lüttekenNames from array of arrays to array of strings
  let airtableNamesString = [];
  let lüttekenNamesString = [];
  airtableNamesString.push(airtableNames.toString())
  lüttekenNamesString.push(lüttekenNames.toString())
  let airtableNamesStringSplit = airtableNamesString[0].split(",")
  let lüttekenNamesStringSplit = lüttekenNamesString[0].split(",")  

  //Loops through airtableNames
  for (let i = 0; i < airtableNamesStringSplit.length; i++) {
    
    //Loops through lüttekenNames
    for (let j = 0; j < lüttekenNamesStringSplit.length; j++) {
      
      /* If the loop's current value of lüttekenNames includes the loop's current value of
      airtableNames, push those results into combinedNames */
      if (airtableNamesStringSplit[i][1] === lüttekenNamesStringSplit[j][1] && airtableNamesStringSplit[i][airtableNamesStringSplit.length] === lüttekenNamesStringSplit[j][lüttekenNamesStringSplit.length]) {
        combinedNames.push(airtableNamesStringSplit[i])
        
      }
    }
  }
  console.log('These names appeared in both lists: ')
  console.log(Array.from(new Set(combinedNames.concat())))
})