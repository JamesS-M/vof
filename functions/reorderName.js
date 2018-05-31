let arr = ['<Piccini, Niccolò> <Goldoni, Carl> <Mozart, Amadeus> <Summerby-Murray, James>']

function extractName(manynames) {
  let cleanNames = [];
  if (manynames.charAt(0) === '<') {
    let pattern = /<(.*?)>/g;
    while(matches = pattern.exec(manynames)) {
      cleanNames.push(matches[1]);
    }
  } else if (manynames.charAt(0) === ''){
  } else {
    cleanNames.push(manynames)
  }
  return cleanNames
}

function reorderName(name) {
  let str = name.toString();
  let regex = /,/
  if (regex.test(str)) {
    let result = str.split(", ");
    if (result[1]) {
    return result[1].substr(0,result[1].length) + ' ' + result[0]
    } else {
      return result[0]
    }
  } else {
    return str
  }
}

// for (let i = 0; i < arr[0].length; i++){
	let extracted = extractName(arr[0])
	console.log(extracted)
	for (let i=0; i<extracted.length; i++){
	console.log(reorderName(extracted[i]))
}
	// console.log(arr[0])
// }