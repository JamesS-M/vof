const {
  format_date,
  split_date,
  remove_quotes,
  normalize_name
} = require('../functions/functions.js')

module.exports = function handleAirtable(data, nameMap, journalInfo) {
  console.log(`${data.length} airtable rows to process...`)
  return data.map((row) => {
    let {
      Opera: opera,
      Alternate_Title: alternateTitle,
      Composer: composer,
      Performance_Date: performanceDate,
      Place: place,
      Troupe: troupe,
      Theater_Journal: theaterJournal,
      Page: page,
      Performance_Language: performanceLanguage,
      Secondary_Source: secondarySource,
      Secondary_Source_Page: secondarySourcePage,
      Longitude: longitude,
      Latitude: latitude,
      Genre: genre
    } = row

    //data massage
    performanceDate = split_date(format_date(performanceDate))
    opera = remove_quotes(opera)
    alternateTitle = remove_quotes(alternateTitle)
    composer = normalize_name(composer, nameMap)

    // assemble query
    let nodeQuery = [
      makePlace(place, longitude, latitude),
      makeIdealOpera(opera, alternateTitle, genre, composer),
      makePerson(composer),
      makeTroupe(troupe),
      makePerformance(opera, alternateTitle, performanceDate, place, troupe, performanceLanguage, longitude, latitude),
      makeJournal(theaterJournal, page),
      makeDate(performanceDate),
      makeLanguage(performanceLanguage),
      makeGenre(genre),
      makeSecondarySource(secondarySource, secondarySourcePage)
    ]
    let relationshipQuery = [
      personalRelationship(composer, opera, performanceDate, troupe),
      performanceRelationship(opera, performanceDate, place, troupe, performanceLanguage),
      textRelationship(theaterJournal, secondarySource, performanceDate),
      genreRelationship(opera, genre)
    ]
    let query = ` ${nodeQuery.join(' ')} ${relationshipQuery.join(' ')}`

    return query
  })
}

const genreRelationship = (opera, genre) => {
  if (!genre || !opera) return ``
  return `MERGE (idealOpera)-[:HAS_GENRE_OF]-(genre)`
}

const textRelationship = (journal, secondarySource, performanceDate) => {
  if (!performanceDate) return ``
  return `MERGE ${
    [
      journal ? `(journal)-[:REFERENCES]-(operaPerformance)` : false,
      secondarySource ? `(secondarySource)-[:REFERENCES]-(operaPerformance)` : false
    ].filter(Boolean).join(' MERGE ')}`
}

const performanceRelationship = (opera, performanceDate, place, performanceLanguage, troupe) => {
  if (!place && !performanceLanguage && !performanceDate.year) return ``
  return `MERGE ${
    [
      (opera && !!performanceDate.year && !!performanceDate.month && !!performanceDate.day) ? `(operaPerformance)-[:PERFORMED_ON]-(date)` : false,
      (opera && place) ? `(operaPerformance)-[:PERFORMED_IN]-(place)` : false,
      (opera && performanceLanguage) ? `(idealOpera)-[:PERFORMED_IN_LANGUAGE]-(language)` : false,
      opera ? `(operaPerformance)-[:PERFORMANCE_OF]-(idealOpera)` : false
    ].filter(Boolean).join(' MERGE ')}`
}

const personalRelationship = (composer, opera, performanceDate, troupe) => {
  if (!composer && !troupe) return ``
  return `MERGE ${
    [
      (opera && composer) ? `(person)-[:COMPOSED]-(idealOpera)` : false,
      (!!performanceDate.year && troupe) ? `(troupe)-[:PERFORMED]-(operaPerformance)` : false
    ].filter(Boolean).join(' MERGE ')}`
}

const makeSecondarySource = (secondarySource, secondarySourcePage) => {
  if (!secondarySource) return ``
  return `MERGE (secondarySource:Secondary_Source {${
    [
      secondarySource ? `Secondary_Source: "${secondarySource}"` : false,
      secondarySourcePage ? `Secondary_Source_Page: ${secondarySourcePage}` : false
    ].filter(Boolean).join(', ')
    }})`
}
const makeGenre = (genre) => {
  if (!genre) return ``
  return `MERGE (genre:Genre {Genre: "${genre}"})`
}

const makeJournal = (journal, page) => {
  if (!journal) return ``
  return `MERGE (journal:Journal {${
    [
      journal ? `Title: "${journal}"` : false,
      page ? `Page: ${page}` : false
    ].filter(Boolean).join(', ')
    }})`
}

const makeLanguage = (performanceLanguage) => {
  if (!performanceLanguage) return ``
  return `MERGE (language:Language {Language: "${performanceLanguage}"})`
}

const makeDate = (performanceDate) => {
  if (!performanceDate.year && !performanceDate.month && !performanceDate.day) return ``
  return `MERGE (date:Date {Date: date({year: ${performanceDate.year}, month: ${performanceDate.month}, day: ${performanceDate.day}})})`
}

const makePerformance = (opera, alternateTitle, performanceDate, place, troupe, performanceLanguage, longitude, latitude) => {
  return `MERGE (operaPerformance:Opera_Performance {${
    [
      opera ? `Opera: "${opera}"` : false,
      alternateTitle ? `Alternate_Title: "${alternateTitle}"` : false,
      (performanceDate && !!performanceDate.year && !!performanceDate.month && !!performanceDate.day) ? `Performance_Date: date({year: ${performanceDate.year}, month: ${performanceDate.month}, day: ${performanceDate.day}})` : false,
      performanceLanguage ? `Performance_Language: "${performanceLanguage}"` : false,
      troupe ? `Troupe: "${troupe}"` : false,
      place ? `City: "${place}"` : false,
      (latitude && longitude) ? `Coordinates: point({longitude: ${`${longitude}, latitude: ${latitude}`}})` : false
    ].filter(Boolean).join(', ')
    }})`
}

const makeTroupe = (troupe) => {
  if (!troupe) return ``
  return `MERGE (troupe:Troupe {Name: "${troupe}"})`
}

const makePerson = (composer) => {
  if (!composer) return ``
  return `MERGE (person:Person:Composer {Name: "${composer}"})`
}

const makePlace = (place, longitude, latitude) => {
  if (!place) return ``
  return `MERGE (place:Place {${
    [
      place ? `City: "${place}"` : false,
      (latitude && longitude) ? `Coordinates: point({longitude: ${`${longitude}, latitude: ${latitude}`}})` : false
    ].filter(Boolean).join(', ')
    }})`
}

const makeIdealOpera = (opera, alternateTitle, genre, composer) => {
  return `MERGE (idealOpera:Ideal_Opera {${
    [
      opera ? `Title: "${opera}"` : false,
      alternateTitle ? `Alternate_Title: "${alternateTitle}"` : false,
      genre ? `Genre: "${genre}"` : false,
      composer ? `Composer: "${composer}"` : false
    ].filter(Boolean).join(', ')
    }})`
}