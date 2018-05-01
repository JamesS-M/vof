
let backwards = ['Summerby-Murray, James Robert', 'Doerwald, Paul', 'Joubert, Estelle']
let regular = ['James Summerby-Murray', 'Timothy Soper', 'Trish Rosswog', 'Paul Doerwald']
let example = [
'Händel, Georg Friedrich'
,'Vittoria,'
,'Heinse, Johann Jacob Wilhelm'
,'Allegri, Gregorio'
,'Lully, Jean Baptiste'
,'Rameau, Jean Philippe'
,'Rousseau, Jean Jacques'
,'Vivaldi, Antonio'
,'Homilius, Gottfried August'
,'Uhde, Johann Otto'
,'Batteux, Charles'
,'Nicolai, David Traugott'
,'Doebbelin, Carl Gottlieb'
,'Niclas, Sophie Marie'
,'André, Johann'
,'Podleska, Thekla'
,'Appelt, Johann'
,'Steibelt, Daniel Gottlieb'
,'Appelt, Johann'
,'Naumann, Johann Gottlieb'
,'Seydelmann, Franz'
,'Schuster, Joseph'
,'Wolf,'
,'Rose, Johann Heinrich Viktor'
,'Bartholomeß, Johann Christoph Gottfried'
,'Rolle, Johann Heinrich'
,'Paradis, Maria Theresia von'
,'Burney, Charles'
,'Kozeluch, Leopold Anton'
,'Pfeffel, Gottlieb Conrad'
,'Vogel, Johann Christoph'
,'Seyfert, Johann Gottfried'
,'Vogler, Georg Joseph'
,'Benda, Georg'
,'Haydn, Joseph'
,'Sterkel, Johann Franz Xaver'
,'Schwanenberger, Johann Gottfried'
,'Grétry, André-Ernest-Modeste'
,'Broschi, gen. Farinelli, Carlo'
,'Lully, Jean Baptiste'
,'Virginie'
,'Vasseur, de' 
,'La Guerre, Marie-Josèphe'
,'Arnoud, Sophie'
,'Legros, Joseph'
,'Larrivée, Henri'
,'Gluck, Christoph Willibald'
,'Rameau, '
,'Vassee,'
,'Friedrich II'
]

function redoName(name) {
	let str = name.toString();
	let regex = /\,/
	if (regex.test(str)) {
		var res = str.split(", ");
		if (res[1]) {
		return res[1].substr(0,res[1].length) + ' ' + res[0];
		} else {
			return res[0]
		}
	} else {
		return str
	}
}

for (let i = 0; i < example.length; i++) {
	let exampleModified = redoName(example[i])
    for (let j = 0; j < regular.length; j++)
      {
       if (backwards[i]==regular[j]){
         console.log(backwards[i])
       } 
      }
      // console.log(exampleModified)
  }