const csvAirtable = '/Users/James/Desktop/Calendar_prefinal.csv'
const csvtojson=require('csvtojson/v1');


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
let airtableArr = [];

csvtojson()
.fromFile(csvAirtable)
.on('csv', (csvRow) => {
  console.log(formatDate(csvRow[7]))
  
})