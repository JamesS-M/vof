let str1 = '[Göckingk, Leopold Friedrich Günther von]: [Über das Münchener Liebhaber-Concert]'
let str2 = 'Schulz, [Johann Abraham Peter]: An die Einfalt.'

function extractReview(review) {
  let cleanReview = [];
  let pattern = /: \[?(.*?)\]?$/
  while(matches = pattern.exec(review)) {
    cleanReview.push(matches[1]);
    if (matches[1].charAt(0) == '[') {
    return cleanReview
    
    }
    return cleanReview
  }
}

console.log(extractReview(str1))