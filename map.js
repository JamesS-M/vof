//Loads the csv file of names
const csvFile = '/Users/James/Documents/CS/OperaticFame/Folder/Mapping\ CSVs/Mapping.csv'
const csv=require('csvtojson')

//Declares an empty array which will hold all of the nested arrays from the csv file
let map =[];

/* A function which accepts a search (name), loops through the nested arrays from csv
and returns the first name of the matching array (map[i][0]). If the search is '', or
an unrecognized name, it returns undefined */
let canonIt = (name) => {
  if (name != ''){
    for (let i = 0; i < map.length; i++) {
      if (map[i].includes(name)) {
        return map[i][0]
      }
    }
  }
}

//This variable is used to search through the name map
let nameSearch = 'Benda'

//Loads the csv from file, and pushes each row into the array map.
csv()
.fromFile(csvFile)
.on('csv', (csvRow) => {
  map.push(csvRow)
})

//After map array has been populated, we can search for a canonical name
.on('done', () => {
console.log(canonIt(nameSearch))
})