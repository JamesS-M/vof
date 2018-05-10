let str1 = 'Jg. 1, St. 40, 31.03.1767, S. 308-312'
let str2 = 'Bd. 1, St. 4, 1783, S. 404-406'
let str3 =  'Jg. 1 (1784), St. 1, S. 82-88'


function extractDetails(details) {
  return details.replace(/(\(\d\d\d\d\)\, )/, '')
}

console.log(extractDetails(str3))