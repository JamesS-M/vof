require('dotenv').config()
const csvtojson = require('csvtojson')

const bolt = process.env.BOLT_CONNECTION
const user = process.env.BOLT_USER
const pass = process.env.BOLT_PASSWORD

const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(bolt, neo4j.auth.basic(user, pass))
const session = driver.session()

// Files
const csvLütteken = '../data/lutteken_reviews.csv'
const csvAirtable = '../data/airtable.csv'

const csvJournalInfo = '../data/journal_info.csv'
const csvNameMap = '../data/name_map.csv'
const csvKeywords = '../data/keywords.csv'

const { extract_name, extract_review, extract_ideal_opera, extract_opera, canon_map, format_date, name_reorder, flatten, extract_theatre } = require('./functions/functions.js')
const handleLutteken = require('./data-handlers/lutteken-export.js')
const handleAirtable = require('./data-handlers/airtable-export.js')
const query = require('./query.js')

!(async function () {
  const nameMap = await csvtojson().fromFile(csvNameMap)
  const keywords = await csvtojson().fromFile(csvKeywords)
  const journalInfo = await csvtojson().fromFile(csvJournalInfo)

  !(async function () {
    query(handleLutteken(await csvtojson().fromFile(csvLütteken), nameMap, journalInfo, keywords), session)
  })()

  !(async function () {
    query(handleAirtable(await csvtojson().fromFile(csvAirtable), nameMap, journalInfo), session)
  })
})()

// const nameMap = []

// Loads nameMapping.csv and pushes each row to a subarray
// csvtojson()
//   .fromFile(nameMap)
//   .on('csv', (csvRow) => {
//     nameMap.push(csvRow)
//   })

//   .on('done', () => {
//     console.log(nameMap)
//   })

// An array which determines which Lütteken row to select
let musikwerkArr = []

// Loads csvLütteken file and pushes desired rows into new array
// csvtojson()
//   .fromFile(csvLüttekenMusikwerk)
//   .on('csv', (csvRow) => {
//     if (csvRow[1] === 'x') {
//       musikwerkArr.push(csvRow[2])
//     }
//   })

// Declares an array that will hold Lütteken's data
let lüttekenArr = []
let keywordsArr = []

// Loads csvLütteken
// csvtojson()
//   .fromFile(csvLütteken)
//   .on('csv', (csvRow) => {
//   // Keywords is used to determine which rows to select
//     let keyword = csvRow['Keyword']

//     // Loops through musikwerkArr, selecting jsonObj that matches
//     for (let i = 0; i < musikwerkArr.length; i++) {
//       for (let j = 0; j < csvRow.length; j++) {
//         if (csvRow[j].includes(musikwerkArr[i])) {
//           lüttekenArr.push(csvRow)
//         }
//       }
//     }
//   })

// // After Lütteken is loaded and manipulated, exports to neo4j
// .on('done', () => {
//   console.log('Finished loading Lütteken. Starting export to NEO4J.')
//   neo4jLüttekenExport(lüttekenArr)
// })

// Declares an array used to hold all of airtable's data
let airtableArr = []

// Loads csvAirtable and pushes data into a new array
// csvtojson()
//   .fromFile(csvAirtable)
//   .on('csv', (csvRow) => {
//     airtableArr.push(csvRow)
//   })

//   // After Airtable is loaded, export to neo4j
//   .on('done', () => {
//     console.log('Finished loading Airtable. Starting export to NEO4J')
//     neo4jAirtableExport(airtableArr)
//   })

function neo4jLüttekenExport(lüttekenArr) {
  console.log(`${lüttekenArr.length} lütteken rows to process`)
  for (let i = 0; i < lüttekenArr.length; i++) {
    // dbuser = 'Paul'
    // dbpass = md5('paul')

    // Publications
    let Review = extract_review(lüttekenArr[i][3])
    let Journal = lüttekenArr[i][4]
    let Publication_1 = lüttekenArr[i][5]
    let Year = lüttekenArr[i][6]
    let Publication_2 = lüttekenArr[i][8]
    let Translated = lüttekenArr[i][11]

    // Opera
    let Ideal_Opera = extract_ideal_opera(lüttekenArr[i][36])
    let originOpera

    //People
    let Person = name_reorder(extract_name(lüttekenArr[i][17]))
    let Composer = name_reorder(lüttekenArr[i][18])
    let Theatre_Director = name_reorder(lüttekenArr[i][20])
    let Performer = name_reorder(lüttekenArr[i][21])
    let Aesthetician = name_reorder(lüttekenArr[i][23])
    let Critic = name_reorder(lüttekenArr[i][24])
    let Impresario = name_reorder(lüttekenArr[i][25])
    let Saint = lüttekenArr[i][26]
    let Librettist = name_reorder(lüttekenArr[i][28])

    // Place
    let Country = lüttekenArr[i][31]
    let City = lüttekenArr[i][34]
    let Theatre = extract_theatre(lüttekenArr[i][40])

    let queryJournal
    let queryReview
    let queryOpera
    let queryPerson
    let queryPlace

    let relsPerson
    let relsPlace
    let relsPublication
    let originJournal

    let originPerson
    let originOrigin

    if (Person !== '') {
      originOrigin = 'MERGE (origin)-[:ORIGIN]-(person) '
    } else if (Composer !== '') {
      Person = Composer
      originOrigin = 'MERGE (origin)-[:ORIGIN]-(person) '
    } else if (Theatre_Director !== '') {
      Person = Theatre_Director
      originOrigin = 'MERGE (origin)-[:ORIGIN]-(person) '
    } else if (Performer !== '') {
      Person = Performer
      originOrigin = 'MERGE (origin)-[:ORIGIN]-(person) '
    } else if (Aesthetician !== '') {
      Person = Aesthetician
      originOrigin = 'MERGE (origin)-[:ORIGIN]-(person) '
    } else if (Critic !== '') {
      Person = Critic
      originOrigin = 'MERGE (origin)-[:ORIGIN]-(person) '
    } else if (Impresario !== '') {
      Person = Impresario
      originOrigin = 'MERGE (origin)-[:ORIGIN]-(person) '
    } else if (Saint !== '') {
      Person = Saint
      originOrigin = 'MERGE (origin)-[:ORIGIN]-(person) '
    } else if (Librettist !== '') {
      Person = librettist
      originOrigin = 'MERGE (origin)-[:ORIGIN]-(person) '
    } else {
      Person = 'No Person'
      originOrigin = ''
    }

    // Query Pieces

    // Person
    if (Person !== 'No Person') {
      if (Composer !== '' && Theatre_Director !== '' && Performer !== '' && Aesthetician !== '' && Critic !== '' && Impresario !== '' && Saint !== '' && Librettist !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (composer:Composer {Name:"' + Composer + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) MERGE (librettist:Librettist {Name:"' + Librettist + '"}) '
        relsPerson = 'MERGE (composer)-[:COMPOSED]-(ideal_opera) MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera) MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint) MERGE (librettist)-[:WROTE_TEXT]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(composer) MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint) MERGE (origin)-[:ORIGIN]-(librettist) MERGE (critic)-[:CRITIQUES]-(review)'
      } else if (Composer !== '' && Theatre_Director !== '' && Performer !== '' && Aesthetician !== '' && Critic !== '' && Impresario !== '' && Saint !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (composer:Composer {Name:"' + Composer + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) '
        relsPerson = 'MERGE (composer)-[:COMPOSED]-(ideal_opera) MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(composer) MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Composer !== '' && Theatre_Director !== '' && Performer !== '' && Aesthetician !== '' && Critic !== '' && Impresario !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (composer:Composer {Name:"' + Composer + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) '
        relsPerson = 'MERGE (composer)-[:COMPOSED]-(ideal_opera) MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(composer) MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Composer !== '' && Theatre_Director !== '' && Performer !== '' && Aesthetician !== '' && Critic !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (composer:Composer {Name:"' + Composer + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) '
        relsPerson = 'MERGE (composer)-[:COMPOSED]-(ideal_opera) MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera)  MERGE (critic)-[:CRITIQUES]-(review) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(composer) MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) '
      } else if (Composer !== '' && Theatre_Director !== '' && Performer !== '' && Aesthetician !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (composer:Composer {Name:"' + Composer + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) '
        relsPerson = 'MERGE (composer)-[:COMPOSED]-(ideal_opera) MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(composer) MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) '
      } else if (Composer !== '' && Theatre_Director !== '' && Performer !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (composer:Composer {Name:"' + Composer + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) '
        relsPerson = 'MERGE (composer)-[:COMPOSED]-(ideal_opera) MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera)  '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(composer) MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) '
      } else if (Composer !== '' && Theatre_Director !== '' && Performer !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (composer:Composer {Name:"' + Composer + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) '
        relsPerson = 'MERGE (composer)-[:COMPOSED]-(ideal_opera) MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(composer) MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) '
      } else if (Composer !== '' && Theatre_Director !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (composer:Composer {Name:"' + Composer + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) '
        relsPerson = 'MERGE (composer)-[:COMPOSED]-(ideal_opera) MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(composer) MERGE (origin)-[:ORIGIN]-(theatre_director) '
      } else if (Composer !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (composer:Composer {Name:"' + Composer + '"}) '
        relsPerson = 'MERGE (composer)-[:COMPOSED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(composer) '
      } else if (Theatre_Director !== '' && Performer !== '' && Aesthetician !== '' && Critic !== '' && Impresario !== '' && Saint !== '' && Librettist !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) MERGE (librettist:Librettist {Name:"' + Librettist + '"}) '
        relsPerson = 'MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint) MERGE (librettist)-[:WROTE_TEXT]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint) MERGE (origin)-[:ORIGIN]-(librettist)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Theatre_Director !== '' && Performer !== '' && Aesthetician !== '' && Critic !== '' && Impresario !== '' && Saint !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) '
        relsPerson = 'MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Theatre_Director !== '' && Performer !== '' && Aesthetician !== '' && Critic !== '' && Impresario !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) '
        relsPerson = 'MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera)  MERGE (critic)-[:CRITIQUES]-(review) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) '
      } else if (Theatre_Director !== '' && Performer !== '' && Aesthetician !== '' && Critic !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) '
        relsPerson = 'MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Theatre_Director !== '' && Performer !== '' && Aesthetician !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) '
        relsPerson = 'MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) '
      } else if (Theatre_Director !== '' && Performer !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) '
        relsPerson = 'MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera)  '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) '
      } else if (Theatre_Director !== '' && Performer !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) '
        relsPerson = 'MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) MERGE (performer)-[:PERFORMED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(theatre_director) MERGE (origin)-[:ORIGIN]-(performer) '
      } else if (Theatre_Director !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (theatre_director:Theatre_Director {Name:"' + Theatre_Director + '"}) '
        relsPerson = 'MERGE (theatre_director)-[:DIRECTED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(theatre_director) '
      } else if (Performer !== '' && Aesthetician !== '' && Critic !== '' && Impresario !== '' && Saint !== '' && Librettist !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) MERGE (librettist:Librettist {Name:"' + Librettist + '"}) '
        relsPerson = 'MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint) MERGE (librettist)-[:WROTE_TEXT]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint) MERGE (origin)-[:ORIGIN]-(librettist)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Performer !== '' && Aesthetician !== '' && Critic !== '' && Impresario !== '' && Saint !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) '
        relsPerson = 'MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint)  MERGE (critic)-[:CRITIQUES]-(review) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint) '
      } else if (Performer !== '' && Aesthetician !== '' && Critic !== '' && Impresario !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) '
        relsPerson = 'MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera)  MERGE (critic)-[:CRITIQUES]-(review) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) '
      } else if (Performer !== '' && Aesthetician !== '' && Critic !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) '
        relsPerson = 'MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Performer !== '' && Aesthetician !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) '
        relsPerson = 'MERGE (performer)-[:PERFORMED]-(ideal_opera)  MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(performer) MERGE (origin)-[:ORIGIN]-(aesthetician) '
      } else if (Performer !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) '
        relsPerson = 'MERGE (performer)-[:PERFORMED]-(ideal_opera)  '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(performer) '
      } else if (Performer !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (performer:Performer {Name:"' + Performer + '"}) '
        relsPerson = 'MERGE (performer)-[:PERFORMED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(performer) '
      } else if (Aesthetician !== '' && Critic !== '' && Impresario !== '' && Saint !== '' && Librettist !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) MERGE (librettist:Librettist {Name:"' + Librettist + '"}) '
        relsPerson = 'MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint) MERGE (librettist)-[:WROTE_TEXT]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint) MERGE (origin)-[:ORIGIN]-(librettist)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Aesthetician !== '' && Critic !== '' && Impresario !== '' && Saint !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) '
        relsPerson = 'MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint)  MERGE (critic)-[:CRITIQUES]-(review) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint) '
      } else if (Aesthetician !== '' && Critic !== '' && Impresario !== '' && Saint !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) '
        relsPerson = 'MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint)  MERGE (critic)-[:CRITIQUES]-(review) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint) '
      } else if (Aesthetician !== '' && Critic !== '' && Impresario !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) '
        relsPerson = 'MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera)  MERGE (critic)-[:CRITIQUES]-(review) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) '
      } else if (Aesthetician !== '' && Critic !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) '
        relsPerson = 'MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) MERGE (critic)-[:CRITIQUED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(aesthetician) MERGE (origin)-[:ORIGIN]-(critic)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Aesthetician !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (aesthetician:Aesthetician {Name:"' + Aesthetician + '"}) '
        relsPerson = 'MERGE (aesthetician)-[:CRITIQUED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(aesthetician) '
      } else if (Critic !== '' && Impresario !== '' && Saint !== '' && Librettist !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) MERGE (librettist:Librettist {Name:"' + Librettist + '"}) '
        relsPerson = 'MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint) MERGE (librettist)-[:WROTE_TEXT]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint) MERGE (origin)-[:ORIGIN]-(librettist)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Critic !== '' && Impresario !== '' && Saint !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) '
        relsPerson = 'MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint)  MERGE (critic)-[:CRITIQUES]-(review) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint) '
      } else if (Critic !== '' && Impresario !== '' && Saint !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) '
        relsPerson = 'MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Critic !== '' && Impresario !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) '
        relsPerson = 'MERGE (critic)-[:CRITIQUED]-(ideal_opera) MERGE (impresario)-[:PRODUCED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(critic) MERGE (origin)-[:ORIGIN]-(impresario)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Critic !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (critic:Critic {Name:"' + Critic + '"}) '
        relsPerson = 'MERGE (critic)-[:CRITIQUED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(critic)  MERGE (critic)-[:CRITIQUES]-(review) '
      } else if (Impresario !== '' && Saint !== '' && Librettist !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) MERGE (librettist:Librettist {Name:"' + Librettist + '"})'
        relsPerson = 'MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint) MERGE (librettist)-[:WROTE_TEXT]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint) MERGE (origin)-[:ORIGIN]-(librettist) '
      } else if (Impresario !== '' && Saint !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) '
        relsPerson = 'MERGE (impresario)-[:PRODUCED]-(ideal_opera) MERGE (ideal_opera)-[:CELEBRATES]-(saint) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(impresario) MERGE (origin)-[:ORIGIN]-(saint) '
      } else if (Impresario !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (impresario:Impresario {Name:"' + Impresario + '"}) '
        relsPerson = 'MERGE (impresario)-[:PRODUCED]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(impresario) '
      } else if (Saint !== '' && Librettist !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) MERGE (librettist:Librettist {Name:"' + Librettist + '"}) '
        relsPerson = 'MERGE (ideal_opera)-[:CELEBRATES]-(saint) MERGE (librettist)-[:WROTE_TEXT]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(saint) MERGE (origin)-[:ORIGIN]-(librettist) '
      } else if (Saint !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (saint:Saint {Name:"' + Saint + '"}) '
        relsPerson = 'MERGE (ideal_opera)-[:CELEBRATES]-(saint) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(saint) '
      } else if (Librettist !== '') {
        queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) MERGE (librettist:Librettist {Name:"' + Librettist + '"}) '
        relsPerson = 'MERGE (librettist)-[:WROTE_TEXT]-(ideal_opera) '
        originPerson = 'MERGE (origin)-[:ORIGIN]-(librettist) '
      } else {
        queryPerson = ''
        relsPerson = ''
        originPerson = ''
      }
    } else {
      queryPerson = ''
      relsPerson = ''
      originPerson = ''
    }

    // Publications
    if (Publication_2 !== '') {
      queryJournal = 'MERGE (journal:Journal {Title:"' + Journal + '"}) '
      relsPublication = 'MERGE (journal)-[:CONTAINS]-(review) '
      originJournal = 'MERGE (journal)-[:ORIGIN]-(origin) '
    } else {
      queryJournal = 'MERGE (journal:Journal {Title:"' + Journal + '"}) '
      relsPublication = 'MERGE (journal)-[:CONTAINS]-(review) '
      originJournal = 'MERGE (journal)-[:ORIGIN]-(origin) '
    }

    // Ideal Opera
    if (Ideal_Opera !== '') {
      queryOpera = 'MERGE (ideal_opera:Ideal_Opera {Title:"' + Ideal_Opera + '"}) '
      originOpera = 'MERGE (origin)-[:ORIGIN]-(ideal_opera) '
    } else {
      queryOpera = ''
      originOpera = ''
    }

    // Place
    if (City !== '') {
      queryPlace = 'MERGE (place:Place {City: "' + City + '"}) '
      relsPlace = 'MERGE (ideal_opera)-[:PERFORMED_IN]-(place) MERGE (origin)-[:ORIGIN]-(place) '
    } else if (Theatre !== '') {
      queryPlace = 'MERGE (place:Place {Theater:"' + Theatre + '"}) '
      relsPlace = 'MERGE (ideal_opera)-[:PERFORMED_IN]-(place) MERGE (origin)-[:ORIGIN]-(place) '
    } else if (Country !== '') {
      queryPlace = 'MERGE (place:Place {Country: "' + Country + '"}) '
      relsPlace = 'MERGE (ideal_opera)-[:PERFORMED_IN]-(place) MERGE (origin)-[:ORIGIN]-(place) '
    } else {
      queryPlace = ''
      relsPlace = ''
    }

    // Review
    if (Review !== '') {
      if (Publication_2 !== '') {
        queryReview = 'MERGE (review:Review {Review:"' + Review + '", Year:"' + Year + '", Continuation:"' + Publication_1 + ', ' + Publication_2 + '", Translated:"' + Translated + '"}) '
        relsReview = 'MERGE (review)-[:REVIEWS]-(ideal_opera) MERGE (origin)-[:ORIGIN]-(review) '
      } else {
        queryReview = 'MERGE (review:Review {Review:"' + Review + '", Year:"' + Year + '", Continuation:"' + Publication_1 + '", Translated:"' + Translated + '"}) '
        relsReview = 'MERGE (review)-[:REVIEWS]-(ideal_opera) MERGE (origin)-[:ORIGIN]-(review) '
      }
    } else {
      queryReview = ''
      relsReview = ''
    }

    let originCredentials = 'MERGE (origin:Origin {user:"' + dbuser + '", password:"' + dbpass + '"}) '

    let queryRels = relsReview + relsPlace + relsPerson + relsPublication + originPerson + originOpera + originJournal

    query = queryJournal + queryReview + queryOpera + queryPerson + queryPlace + originCredentials + originOrigin + queryRels

    session
      .run(query)
      .then(function (result) {
        console.log('Lütteken finished processing row ' + i)
      })
  }
  return
}

function neo4jAirtableExport(airtableArr) {
  let query
  console.log(airtableArr.length + ' airtable rows to process')

  for (let i = 0; i < airtableArr.length; i++) {
    // dbuser = 'Austin'
    // dbpass = md5('austin')

    // Opera
    let Ideal_Opera = airtableArr[i][2]
    let Alternate_Title = airtableArr[i][3]
    let Performance_Language = airtableArr[i][5]
    let Performance_Date = format_date(airtableArr[i][6])
    let Genre = airtableArr[i][7]
    let Troupe = airtableArr[i][8]

    // People
    let Composer = airtableArr[i][4]
    let Person = airtableArr[i][4]

    // Place
    let Place = airtableArr[i][9]
    let Latitude = airtableArr[i][10]
    let Longitude = airtableArr[i][11]

    // Publications
    let Theatre_Journal = airtableArr[i][12]
    let Theatre_Page = airtableArr[i][13]
    let Secondary_Source = airtableArr[i][14]
    let Secondary_Source_Page = airtableArr[i][15]

    // Query Pieces
    let queryOpera
    let queryJournal
    let querySecondSource
    let queryPerf
    let queryPerson
    let queryComposer
    let queryPlace

    let relsPerson
    let relsOpera
    let relsPlace
    let relsPerf
    let relsTroupe
    let relsJournal

    let queryRels

    let Origin = 'MERGE (origin:Origin {user:"' + dbuser + '", password:"' + dbpass + '"})'


    if (Ideal_Opera !== '' && Genre !== '') {
      queryOpera = 'MERGE (ideal_opera:Ideal_Opera {Title:"' + Ideal_Opera + '", Genre:"' + Genre + '"}) '
      relsOpera = 'MERGE (origin)-[:ORIGIN]-(ideal_opera) '
    } else if (Ideal_Opera !== '') {
      queryOpera = 'MERGE (ideal_opera:Ideal_Opera {Title:"' + Ideal_Opera + '"}) '
      relsOpera = 'MERGE (origin)-[:ORIGIN]-(ideal_opera) '
    } else {
      queryOpera = ''
      relsOpera = ''
    }


    if (Person !== '') {
      queryPerson = 'MERGE (person:Person {Name:"' + Person + '"}) '
      queryComposer = 'MERGE (composer:Composer {Name:"' + Composer + '"}) '
      relsPerson = 'MERGE (composer)-[:WROTE]-(ideal_opera) MERGE (person)-[:WROTE]-(ideal_opera) MERGE (origin)-[:ORIGIN]-(composer) MERGE (origin)-[:ORIGIN]-(person) '
    } else {
      queryPerson = ''
      queryComposer = ''
      relsPerson = ''
    }


    if (Place !== '') {
      queryPlace = 'MERGE (place:Place {City: "' + Place + '", Latitude:"' + Latitude + '", Longitude:"' + Longitude + '"}) '
      relsPlace = 'MERGE (opera_perf)-[:PERFORMED_IN]-(place) MERGE (origin)-[:ORIGIN]-(place) '
    } else {
      queryPlace = ''
      relsPlace = ''
    }


    if (Troupe !== '') {
      queryTroupe = 'MERGE (troupe:Troupe {Name: "' + Troupe + '"}) '
      relsTroupe = 'MERGE (troupe)-[:PERFORMED]-(opera_perf) MERGE (origin)-[:ORIGIN]-(troupe) '

    } else {
      queryTroupe = ''
      relsTroupe = ''
    }


    if (Performance_Date !== '') {
      queryPerf = 'MERGE (opera_perf:Opera_Performance {Title: "' + Ideal_Opera + '", Alternate_Title: "' + Alternate_Title + '", Date: "' + Performance_Date + '", Language: "' + Performance_Language + '"}) '
      relsPerf = 'MERGE (opera_perf)-[:PERFORMANCE_OF]-(ideal_opera) MERGE (origin)-[:ORIGIN]-(opera_perf) '
    } else {
      queryPerf = ''
      relsPerf = ''
    }


    if (Theatre_Journal !== '') {
      queryJournal = 'MERGE (journal:Journal {Title: "' + Theatre_Journal + '", Page: "' + Theatre_Page + '"}) '
      relsJournal = 'MERGE (journal)-[:REFERENCES]-(opera_perf) MERGE (journal)-[:ORIGIN]-(origin) '
    } else if (Secondary_Source !== '') {
      queryJournal = 'MERGE (journal:Secondary_Source {Title:"' + Secondary_Source + '", Page:"' + Secondary_Source_Page + '"}) '
      relsJournal = 'MERGE (journal)-[:REFERENCES]-(opera_perf) MERGE (journal)-[:ORIGIN]-(origin) '
    } else {
      queryJournal = ''
      relsJournal = ''
    }


    queryRels = relsPerson + relsPlace + relsTroupe + relsJournal + relsPerf + relsOpera

    query = queryOpera + queryPerf + queryJournal + queryPerson + queryComposer + queryTroupe + queryPlace + Origin + queryRels

    session
      .run(query)
      .then(function (result) {
        ('Airtable finished processing row ' + i)
      })
  }
  return
}
