let str1 = '[Göckingk, Leopold Friedrich Günther von]: [Über das Münchener Liebhaber-Concert]'
let str2 = 'Schulz, [Johann Abraham Peter]: An die Einfalt.'

function extractReview(review) {
  let cleanReview = [];
  let pattern = /: \[?(.*?)\]?$/
  let match = pattern.exec(review)
  return match[1]
}

console.log(extractReview(str1))