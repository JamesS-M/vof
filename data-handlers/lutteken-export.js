const {
  extract_review,
  extract_ideal_opera,
  extract_name,
  name_reorder,
  extract_theatre,
  normalize_journal,
  normalize_name,
  validate_data
} = require('../functions/functions.js')

module.exports = function handleLutteken(data, nameMap, journalInfo, keywords) {
  console.log(`${data.length} lutteken rows to process...`)
  return data.map(({
    ReviewTitle: review,
    JournalShortTitle: journal,
    EntryDetails: publication1,
    Continuation: publication2,
    Year: year,
    Translated: translated,
    IdealOpera: idealOpera,
    Person: person,
    Critic: critic,
    Composer: composer,
    Place: place,
    Theatre: theatre
  }) => {

    // data massage
    review = extract_review(review)
    idealOpera = validate_data(extract_ideal_opera(idealOpera))
    person = validate_data(normalize_name(name_reorder(extract_name(person)), nameMap))
    theatre = validate_data(extract_theatre(theatre))
    journal = validate_data(normalize_journal(journal, journalInfo))
    place = validate_data(extract_name(place).join(', '))
    publication1 = validate_data(publication1)
    publication2 = validate_data(publication2)
    year = validate_data(year)
    translated = validate_data(translated)
    critic = validate_data(critic)
    composer = validate_data(composer)

    // assemble query
    let nodeQuery = [
      makeJournal(journal),
      makeReview(review, publication1, publication2, journal, translated, year),
      makePerson(person),
      makeIdealOpera(idealOpera),
      makePlace(place, theatre),
      makeCritic(critic),
      makeComposer(composer)
    ]
    let relationshipQuery = [
      personRelationship(person, composer, critic, idealOpera, review),
      idealOperaRelationship(idealOpera, place, review),
      journalRelationships(journal, review)
    ]
    let query = ` ${nodeQuery.join(' ')} ${relationshipQuery.join(' ')}`

    return query
  })
}

const journalRelationships = (journal, review) => {
  if (!review || !journal) return ``
  return `MERGE ${[
    (journal && review) ? `(journal)-[:CONTAINS]-(review)` : false
  ].filter(Boolean).join(' MERGE ')}`
}

const personRelationship = (person, composer, critic, idealOpera, review) => {
  if (!person && !composer && !critic && !idealOpera) return ``
  return `MERGE ${[
    (person && review) ? `(person)-[:ASSOCIATED_WITH]-(review)` : false,
    (composer && idealOpera) ? `(composer)-[:COMPOSED]-(idealOpera)` : false,
    (critic && idealOpera) ? `(critic)-[:CRITIQUED]-(idealOpera)` : false,
    (composer && review) ? `(composer)-[:ASSOCIATED_WITH]-(review)` : false,
    (critic && review) ? `(critic)-[:ASSOCIATED_WITH]-(review)` : false
  ].filter(Boolean).join(' MERGE ')}`
}

const idealOperaRelationship = (idealOpera, place, review, composer) => {
  if (!idealOpera) return ``
  return `MERGE ${[
    (idealOpera && place) ? `(place)-[:PERFORMED_IN]-(idealOpera)` : false,
    (idealOpera && review) ? `(review)-[:REVIEWS]-(idealOpera)` : false,
    (idealOpera && composer) ? `(composer)-[:WROTE]-(idealOpera)` : false
  ].filter(Boolean).join(' MERGE ')}`
}

const makePlace = (place, theatre) => {
  if (!place) return ``
  return `MERGE (place:Place {${
    [
      place ? `City: "${place}"` : false,
      theatre ? `Theatre: "${theatre}"` : false
    ].filter(Boolean).join(', ')
    }})`
}

const makeReview = (review, publication1, publication2, journal, translated, year, critic) => {
  if (!review) return ``
  return `MERGE (review:Review {${
    [
      review ? `Review: "${review}"` : false,
      (publication1 || publication2) ? `Continuation: "${publication1 || ''} ${publication1 ? ', ' : ''}${publication2 || ''}"` : false,
      journal ? `Journal: "${typeof (journal) === 'string' ? journal : journal.Journal}"` : false,
      year ? `Year: date({year: ${year}})` : false,
      translated ? `Translated: "${translated}"` : false,
      critic ? `Critic: "${critic}"` : false
    ].filter(Boolean).join(', ')}})`
}

const makeCritic = (critic) => {
  if (!critic) return ``
  return `MERGE (critic:Critic {Name: "${critic}"})`
}

const makeComposer = (composer) => {
  if (!composer) return ``
  return `MERGE (composer:Composer {Name: "${composer}"})`
}

const makePerson = (person) => {
  if (!person) return ``
  return `MERGE (person:Person {Name: "${person}"})`
}

const makeJournal = (journal) => {
  if (!journal) return ``
  let query = `MERGE (journal:Journal {Title:"`
  if (typeof (journal) === 'string') {
    return query += `${journal}"})`
  }
  let { Journal, Publisher, Editor, Dates } = journal

  return query += `${Journal}", Publisher:"${Publisher}", Editor:"${Editor}", Dates:"${Dates}"})`
}

const makeIdealOpera = (idealOpera, composer) => {
  if (!idealOpera) return ``
  return `MERGE (idealOpera:Ideal_Opera {${
    [
      idealOpera ? `Title:"${idealOpera}"` : false,
      composer ? `Composer:${composer}` : false
    ].filter(Boolean).join(', ')
    }})`
}