const csvFilePath='/Users/James/Documents/NEO4J/Folder/Input/ReviewsTest.csv'
const csvOutputFilePath = '/Users/James/Documents/NEO4J/Folder/Output/Reviews.csv'

const csvtojson=require('csvtojson')
const fs = require('fs')
const Json2csvParser=require('json2csv').Parser;



function extractName(manynames) {
  let cleanNames = [];
  let pattern = /<(.*?)>/g;
  while(matches = pattern.exec(manynames)) {
    cleanNames.push(matches);
}
  return cleanNames
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
          "Vergleich Oper/Drama"]

csvtojson()
.fromFile(csvFilePath)
.on('json', (jsonObj, rowIndex) => { 
  let seperatedKeyword = extractName(jsonObj['Keyword'])
  // console.log(seperatedKeyword)
  for (i = 0; i < seperatedKeyword.length; i++) {
    let newArray = [];
    newArray.push(seperatedKeyword[i][1])
    console.log(newArray) 
  }
})


/*
Convert jsonObj['Keywords'] to new array of keywords

/*
knownKeywords {
  modifiedKeywords {
    if LOOP1[i] === LOOP2[j]{
      push LOOP2 to new array
    }
  }
}
*/