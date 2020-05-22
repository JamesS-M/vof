const step = 1000
const {
  format_date,
  split_date,
  remove_quotes
} = require('../functions/functions.js')

module.exports = function handleAirtable(data, nameMap, journalInfo, iteration) {
  data = data.slice((iteration * step), (iteration + 1) * step)
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
    performanceDate = split_date(format_date(performanceDate))
    opera = remove_quotes(opera)
    alternateTitle = remove_quotes(alternateTitle)

    let nodeQuery = [
      makePlace(place, longitude, latitude),
      makeIdealOpera(opera, alternateTitle, genre),
      makePerson(composer),
      makeTroupe(troupe),
      makePerformance(opera, alternateTitle, performanceDate, place, troupe, performanceLanguage, longitude, latitude),
      makeJournal(theaterJournal, page),
      makeSecondarySource(secondarySource, secondarySourcePage)
    ]

    let relationshipQuery = []

    return ` ${nodeQuery.join(' ')} ${relationshipQuery.join(' ')}`
  })
}

const makeSecondarySource = (secondarySource, secondarySourcePage) => {
  if (!secondarySource) return ``
  return `MERGE (:Secondary_Source {${
    [
      secondarySource ? `Secondary_Source: "${secondarySource}"` : false,
      secondarySourcePage ? `Secondary_Source_Page: ${secondarySourcePage}` : false
    ].filter(Boolean).join(', ')
    }})`
}

const makeJournal = (journal, page) => {
  if (!journal) return ``
  return `MERGE (:Journal {${
    [
      journal ? `Title: "${journal}"` : false,
      page ? `Page: ${page}` : false
    ].filter(Boolean).join(', ')
    }})`
}

const makePerformance = (opera, alternateTitle, performanceDate, place, troupe, performanceLanguage, longitude, latitude) => {
  return `MERGE (:Opera_Performance {${
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
  return `MERGE (:Troupe {Name: "${troupe}"})`
}

const makePerson = (composer) => {
  if (!composer) return ``
  return `MERGE (:Person {Name: "${composer}"})`
}

const makePlace = (place, longitude, latitude) => {
  return `MERGE (:Place {${
    [
      place ? `City: "${place}"` : false,
      (latitude && longitude) ? `Coordinates: point({longitude: ${`${longitude}, latitude: ${latitude}`}})` : false
    ].filter(Boolean).join(', ')
    }})`
}

const makeIdealOpera = (opera, alternateTitle, genre) => {
  return `MERGE (:Ideal_Opera {${
    [
      opera ? `Title: "${opera}"` : false,
      alternateTitle ? `Alternate_Title: "${alternateTitle}"` : false,
      genre ? `Genre: "${genre}"` : false
    ].filter(Boolean).join(', ')
    }})`
}