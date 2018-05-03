const csvtojson=require('csvtojson')
const fs = require('fs')
const Json2csvParser=require('json2csv').Parser;

const csvFilePath = '/Users/James/Documents/CS/OperaticFame/Folder/Input/csv/Composers.csv'

csvtojson()
.fromFile(csvFilePath)
.on('json', (jsonObj, rowIndex)=>{
	
	console.log(jsonObj.Name)
})
.on('done', (error)=> {
})