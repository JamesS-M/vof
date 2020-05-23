const csvtojson = require('csvtojson')
const runProcess = process.argv[process.argv.length - 1]

const csvLütteken = '../data/lutteken_reviews.csv'
const csvAirtable = '../data/airtable.csv'
const csvJournalInfo = '../data/journal_info.csv'
const csvNameMap = '../data/name_map.csv'
const csvKeywords = '../data/keywords.csv'

const handleLutteken = require('./data-handlers/lutteken-export.js')
const handleAirtable = require('./data-handlers/airtable-export.js')
const performQueries = require('./query')

!(async function () {
  const nameMap = await csvtojson().fromFile(csvNameMap)
  const keywords = await csvtojson().fromFile(csvKeywords)
  const journalInfo = await csvtojson().fromFile(csvJournalInfo)

  const getLuttekenData = async () => performQueries(handleLutteken(await csvtojson().fromFile(csvLütteken), nameMap, journalInfo, keywords))

  const getAirtableData = async () => performQueries(handleAirtable(await csvtojson().fromFile(csvAirtable), nameMap, journalInfo))

  !(async function () {
    switch (runProcess) {
      case 'l': {
        return getLuttekenData()
      }
      case 'a': {
        return getAirtableData()
      }
      default: {
        return (
          await getLuttekenData() && await getAirtableData())
      }
    }
  })()
})()