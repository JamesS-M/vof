
let backwards = ['Summerby-Murray, James', 'Doerwald, Paul', 'Joubert, Estelle']
let regular = ['James Summerby-Murray', 'Timothy Soper', 'Trish Rosswog', 'Paul Doerwald']

function redoName(name) {
	let pattern = /\,*?/g;
	return pattern.exec(name)
}


for (let i = 0; i < backwards.length; i++)
  {
    for (let j = 0; j < regular.length; j++)
      {
       if (backwards[i]===regular[j]){
         console.log(backwards[i])
       } 
      }
  }

  console.log(redoName(backwards))