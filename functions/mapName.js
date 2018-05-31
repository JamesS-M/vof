//Loads the csv file of names
const csvFile = '/Users/James/Documents/CS/OperaticFame/Folder/Mapping\ CSVs/nameMapping.csv'
const csvtojson=require('csvtojson')

//Declares an empty array which will hold all of the nested arrays from the csv file
let map =[];

/* A function which accepts a search (name), loops through the nested arrays from csv
and returns the first name of the matching array (map[i][0]). If the search is '', or
an unrecognized name, it returns undefined */
let canonIt = (name) => {
  if (name != '' || name == undefined){
    for (let i = 0; i < map.length; i++) {
      if (map[i].includes(name)) {
        return map[i][0]
      }
    }
  }
}

let canonItCase = (name) => {
	switch(name) {
	case '':
	console.log('Empty input' + '"' + name + '"')
	break;
	case ' ':
	console.log('Empty input:' + '"' + name + '"')
	default:
	for (let i = 0; i < map.length; i++) {
      if (map[i].includes(name)) {
        return map[i][0]
      }
    }
	}
}

//This variable is used to search through the name map
let nameSearch = ' '

//Loads the csv from file, and pushes each row into the array map.
csvtojson()
.fromFile(csvFile)
.on('csv', (csvRow) => {
  map.push(csvRow)
})

//After map array has been populated, we can search for a canonical name
.on('done', () => {
console.log(canonItCase(nameSearch))
})