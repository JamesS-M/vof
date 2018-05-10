const LüttekenCSV='/Users/James/Documents/CS/OperaticFame/Folder/Input/csv/Reviews.csv'
const AirtableCSV='/Users/James/Documents/CS/OperaticFame/Folder/Input/csv/Composers.csv'

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
      console.log(res[1].substr(0, res[1].length) + ' ' + res[0])
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

  //Flattens both arrays into array of strings
  let airtableNamesFlat = flatten(airtableNames)
  let lüttekenNamesFlat = flatten(lüttekenNames)
  
  //Loops through airtable names, and lütteken names
  for (let i = 0; i < airtableNamesFlat.length; i++) {
    for (let j = 0; j < lüttekenNamesFlat.length; j++) {

      //If results are the same, push results to combinedNames
      if (airtableNamesFlat[i].includes(lüttekenNamesFlat[j])) {
        combinedNames.push(airtableNamesFlat[i])
      }
    }
  }

//Logs the combined names
console.log('Both lists contained: ')
console.log(combinedNames)
})