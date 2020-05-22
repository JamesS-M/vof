module.exports = {
  extract_name: function (manyNames) {
    let cleanNames = []

    if (manyNames.charAt(0) === '<') {
      let pattern = /<(.*?)>/g
      while (matches = pattern.exec(manyNames)) {
        cleanNames.push(matches[1])
      }
    } else if (manyNames.charAt(0) === '') {
    } else {
      cleanNames.push(manyNames)
    }
    return cleanNames
  },

  remove_quotes: function (string) {
    return string.replace(/\"/g, '')
  },

  extract_opera: function (opera) {
    let cleanOperas = []
    if (opera.charAt(0) === '<') {
      let pattern = /<.*?: (.*?)( \(\d\d\d\d\))?>/g
      while (matches = pattern.exec(opera)) {
        cleanOperas.push(matches[1])
      }
    } else {
      cleanOperas.push(opera)
    }
    return cleanOperas
  },

  canon_map: function (name, map) {
    if (name != '') {
      for (let a = 0; a < map.length; a++) {
        if (map[a].includes(name)) {
          return map[a][0]
        }
      }
    } else {
      return name
    }
  },

  split_date: function (date) {
    let [year, month, day] = date.split('-')
    year = parseInt(year)
    month = parseInt(month)
    day = parseInt(day)
    return {
      year, month, day
    }
  },

  format_date: function (date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join('-')
  },

  name_reorder: function (name) {
    let str = name.toString()
    let regex = /,/
    if (regex.test(str)) {
      let result = str.split(", ")
      if (result[1]) {
        return result[1].substr(0, result[1].length) + ' ' + result[0]
      } else {
        return result[0]
      }
    } else {
      return str
    }
  },

  extract_review: function (review) {
    let pattern = /: \[?(.*?)\]?$/
    let match = pattern.exec(review)
    return match ? match[1] : ''
  },


  extract_ideal_opera: function (opera) {
    if (opera.length == 0) {
      return
    }
    let cleanOpera = []
    let pattern = /: (.*?)[\.-\>]/
    while (matches = pattern.exec(opera)) {
      cleanOpera.push(matches[1])
      return cleanOpera.toString()
    }
  },

  flatten: function (a, shallow, r) {
    if (!r) {
      r = []
    }
    if (shallow) {
      return r.concat.apply(r, a)
    }
    for (var i = 0; i < a.length; i++) {
      if (a[i].constructor == Array) {
        flatten(a[i], shallow, r)
      } else {
        r.push(a[i])
      }
    }
    return r
  },

  extract_theatre: function (manynames) {
    let cleanNames = []
    if (manynames.charAt(0) === '<') {
      let pattern = /<(.*?),/g
      while (matches = pattern.exec(manynames)) {
        cleanNames.push(matches[1])
      }
    } else {
      cleanNames.push(manynames)
    }
    return cleanNames.toString()
  },

  normalize_journal(journal, journalMap) {
    return journalMap.find(nrmlJournal => {
      return nrmlJournal['Journal'] === journal
    }) || journal
  },

  normalize_name(name, nameMap) {
    if (name != '') {
      let found = nameMap.find(canon => Object.values(canon).includes(name))
      return found ? found.Canonical : name
    } else {
      return name
    }
  },

  chunk_array(myArray, chunk_size) {
    var results = []

    while (myArray.length) {
      results.push(myArray.splice(0, chunk_size))
    }

    return results
  }
}




/*

idealOpera:Ideal_Opera {Title}
person:Person {Name}
journal:Journal {Title, Publisher, Editor, Dates}
place:Place {Theatre}
review: Review {Title, Year, Continuation(pbl1, pbl2), Translated, Journal}


*/