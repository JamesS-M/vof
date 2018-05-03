const csvFile = '/Users/James/Documents/CS/Operatic\ Fame/Folder/Mapping\ CSVs/Mapping.csv'
const csv=require('csvtojson')
const fs = require('fs')
const Json2csvParser=require('json2csv').Parser;

let map =[];

let canonIt = (name) => {
  if (name != ''){
    for (let i = 0; i < map.length; i++) {
      if (map[i].includes(name)) {
        // if (mappingArr[i])
        return map[i][0]
      }
    }
  }
}

let nameSearch = 'Benda'

csv()
.fromFile(csvFile)
.on('csv', (csvRow) => {
  // console.log(csvRow)
  map.push(csvRow)

})
.on('done', () => {
  // console.log(map)
console.log(canonIt(nameSearch))
})