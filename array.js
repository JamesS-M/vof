let airtable = [
'André-Ernest-Modeste Grétry'
,'Anton Schweitzer'
,'Anton Schweitzer/Ernst Wilhelm Wolf?'
,'Antonio  Salieri'
,'Antonio Sacchini'
,'Carl David Stegmann'
,'Carl Ditters'
,'Caspar Hellmich'
,'Christian Gottlob Neefe'
,'Christian Ludwig Dieter'
,'Christoph Willibald Gluck'
,'Domenico Cimarosa'
,'Egidio Romualdo Duni'
,'Ernst Wilhelm Wolf'
,'Etienne Nicolas Méhul'
,'Florian Gassmann'
,'François-André Danican Philidor'
,'Franz Seydelmann'
,'Georg Anton Kreußer'
,'Georg Benda'
,'Giovanni Paisiello'
,'Giuseppe Sarti'
,'Hugo Franz Freiherr von Kerpen'
,'Ignaz Schuster and Wenzel Müller'
,'Ignaz Umlauf'
,'Ignaz Walter (the older)'
,'Jean Baptiste Lemoyne'
,'Jean-Paul-Gilles Martini'
,'Johann Adam Hiller'
,'Johann André'
,'Johann Christoph von Zabuesnig'
,'Johann Friedrich Hönicke'
,'Johann Friedrich Reichardt'
,'Joseph Schuster'
,'Niccolò Piccinni'
,'Nicolas Dalayrac'
,'Nicolas Dezède'
,'Otto Carl Erdmann Freiherr von Kospoth'
,'Paul Wranitzky'
,'Peter von Winter'
,'Pierre-Alexandre Monsigny'
,'Pietro Alessandro Guglielmi'
,'Stanislaus de Champein'
,'Vicente Martín y Soler'
,'Vincenzo Righini'
,'Wolfgang Amadeus Mozart'
,'Johann Abraham Peter Schulz'
,'Stanislas Spindler'
,'Pasquale Anfossi'
,'Ferdinand Fränzl'
  ]
let lütteken = [
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

let combined = [];

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
console.log(lütteken.length)
for (let i = 0; i < airtable.length; i++) {
	let lüttekenModified = redoName(lütteken[i])
    for (let j = 0; j < lüttekenModified.length; j++)
      {
       if (airtable[i] !==lüttekenModified[j]){
         combined.push(airtable[i])
       } 
      }
      console.log(combined)
  }