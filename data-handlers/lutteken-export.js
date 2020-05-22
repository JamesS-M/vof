const {
  extract_review,
  extract_ideal_opera,
  extract_name,
  name_reorder,
  extract_theatre,
  normalize_journal,
  normalize_name
} = require('../functions/functions.js')

module.exports = function handleLutteken(data, nameMap, journalInfo, keywords) {
  data = data.slice(0, 10)
  console.log(`${data.length} lutteken rows to process...`)
  return data.reduce((str, row) => {
    // console.log(Object.keys(row))

    let {
      ReviewTitle: review,
      JournalShortTitle: journal,
      EntryDetails: publication1,
      Continuation: publication2,
      Year: year,
      Translated: translated,
      IdealOpera: idealOpera,
      Person: person,
      Place: place,
      Theatre: theatre,
    } = row, query

    // data massaging
    review = extract_review(review)
    idealOpera = extract_ideal_opera(idealOpera)
    person = normalize_name(name_reorder(extract_name(person)), nameMap)
    theatre = extract_theatre(theatre)
    journal = normalize_journal(journal, journalInfo)
    place = extract_name(place).join(', ')

    // assemble query
    let nodeQuery = [
      makeJournal(journal),
      makeReview(review, publication1, publication2, journal, translated, year),
      makePerson(person),
      makeIdealOpera(idealOpera),
      makePlace(place, theatre)
    ]

    let relationshipQuery = []

    return str += ` ${nodeQuery.join(' ')} ${relationshipQuery.join(' ')}`
  }, '')
}

function makePlace(place, theatre) {
  return `MERGE (place:Place {${
    [
      place ? `City: "${place}"` : false,
      theatre ? `Theatre: "${theatre}"` : false
    ].filter(Boolean).join(', ')
    }})`
}
function makeReview(review, publication1, publication2, journal, translated, year) {
  if (!review) return ``
  return `MERGE (review:Review {${
    [
      review ? `Review: "${review}"` : false,
      (publication1 || publication2) ? `Continuation: "${publication1 || ''} ${publication1 ? ', ' : ''}${publication2 || ''}"` : false,
      journal ? `Journal: "${typeof (journal) === 'string' ? journal : journal.Journal}"` : false,
      year ? `Year: date({year:${year}})` : false,
      translated ? `Translated: "${translated}"` : false
    ]
      .filter(Boolean).join(', ')})}`
}
function makePerson(person) {
  if (!person) return ``
  return `MERGE (person:Person {Name:"${person}"})`
}
function makeJournal(journal) {
  if (!journal) return ``
  let query = `MERGE (journal:Journal {Title:"`
  if (typeof (journal) === 'string') {
    return query += `${journal}"})`
  }
  let { Journal, Publisher, Editor, Dates } = journal

  return query += `${Journal}", Publisher:"${Publisher}", "Editor:"${Editor}", Dates:"${Dates}"})`
}
function makeIdealOpera(idealOpera) {
  if (!idealOpera) return ``
  return `MERGE (ideal_opera:Ideal_Opera {Title:"${idealOpera}"})`
}