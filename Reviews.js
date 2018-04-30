/* Creates a filter that converts Reviews.csv (from Lütteken database)
loads it as an array of JSON objects, checks for "Keywords" that match keywords 
highlighted in Schlagworte.csv */

const csvFilePath='/Users/James/Documents/NEO4J/Folder/Input/Reviews.csv'
const csvOutputFilePath = '/Users/James/Documents/NEO4J/Folder/Output/Reviews.csv'

const csvtojson=require('csvtojson')
const fs = require('fs')
const Json2csvParser=require('json2csv').Parser;

let reviewArray=[]



function extractName(manynames) {
  // let pattern = /<(.*?)>/g
  // let matches = pattern.exec(manynames)
  
  //return array_of_cleaned_up_names
}

// Creates json object from csv file
csvtojson()
.fromFile(csvFilePath)
.on('json',(jsonObj, rowIndex)=>{

    // Assigns array values
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

  // Opens a loop which runs for every entry of knownKeywords(22 times)
  for (let i = 0; i < knownKeywords.length; i++) {
          
      // Splits jsonObj into seperate strings
    let seperatedKeyword = jsonObj['Keyword'].split(" ")

    // Opens a loop which runs through all Keywords in jsonObj
    for (let j = 0; j < seperatedKeyword.length; j++){
      // let keywords = splitField(jsonObj['Keyword'])
      // Removes '<', '>' from end of strings. Returns new values as text variable.
      let keywords = seperatedKeyword[j].substring(1, (seperatedKeyword[j].length)-1);

      /* Compares the keyword of jsonObj(text) to the current keyword of knownKeywords, 
      push matches into reviewArray */
      if (keywords.includes(knownKeywords[i])) { 
        let splitPeople = jsonObj['People'].split(" ");
        for (let i = 0; i < splitPeople.length; i++){
          let seperatePeople = splitPeople[i].substring(1, splitPeople[i].length-1)
          console.log(seperatePeople) 
        }             
        // reviewArray.push(newObj);
        console.log(reviewArray)         
      }
    }
  }

}).on('done', () => {
    const fields = Object.keys(reviewArray[0])
    const json2csvParser = new Json2csvParser({ fields });

    const csvFile = json2csvParser.parse(reviewArray);
    console.log(csvFile)

    // fs.writeFileSync(csvOutputFilePath, csvFile, function(err) {
    //  if (err) throw err;
    //  console.log('File Saved')
    // })

})
