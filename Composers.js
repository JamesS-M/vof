/*
Create a filter that converts composers.csv (as taken from Airtable)
loads it as an array of JSON objects, applies modifications, and
saves a new csv.
*/

const csvFilePath = '/Users/James/Documents/CS/OperaticFame/Folder/Input/csv/Composers.csv'
const csvOutputFilePath = '/Users/James/Documents/CS/Folder/Output/Composers.csv'

const csvtojson = require('csvtojson/v1')
const fs = require('fs')
const Json2csvParser = require('json2csv').Parser

let composersArray = []

// Creates json object from csv file
csvtojson()
  .fromFile(csvFilePath)
  .on('json', (jsonObj, rowIndex) => {
    // Removes unused columns
    // delete jsonObj['Calendar Items']
    // delete jsonObj['Attachments']
    // delete jsonObj['Notes']
    // delete jsonObj['composer']
    // Pushes jsonObj into composersArray
    composersArray.push(jsonObj['Name'])
  })
  .on('done', () => {
    // Creates new object from Json2csvParser
    // const fields = ['Name'];
    // const json2csvParser = new Json2csvParser({ fields });

    // // Writes csvFile to console
    // const csvFile = json2csvParser.parse(composersArray);
    // (csvFile)

    // Creates Composers.csv with data from csvFile
    // fs.writeFile(csvOutputFilePath, csvFile, function(err) {
    //     if (err) throw err;
    //     ('file saved');
    // })
  })
