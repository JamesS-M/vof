
let str1 = '<Rousseau, Jean-Jacques/Rousseau: Le devin de village><Summerby-Murray, James: The Song of Javascript><Vivaldi, Antonio: La primavera, op. 8,1 [Le quattro stagioni]>'

let str2 = '<Homilius, Gottfried August: Passionskantate (1765)>'

let str3 = '<Walter, Ignaz/Bergopzoomer: Graf von Waltron, oder Die Subordination> <Grétry, André-Ernest-Modeste/d\'Héle: Le jugement de Midas> <Paisiello, Giovanni/Palomba und Bretzner (Übers.): Die schöne Müllerin [La Molinara]> <Paisiello u. a.: Das listige Kammermädchen> <Müller, Wenzel/Hensler: Das Sonnenfest der Braminen> <Kospoth, Otto Carl Erdmann Freiherr von/Herklots: Der Mädchenmarkt zu Ninive> <Mozart, Wolfgang Amadeus/Schikaneder: Die Zauberflöte> <Salieri, Antonio/DaPonte und Vulpius (Übers.): Das Kästchen mit der Chiffer [La cifra]>'

// /<.*?: (.*?)( \(\d\d\d\d\))?>/



function extractOpera(opera) {
  let cleanOperas = [];
  if(opera.charAt(0) === '<') {
    let pattern = /<.*?: (.*?)( \(\d\d\d\d\))?>/g;
    while(matches = pattern.exec(opera)) {
      // console.log(matches)
      cleanOperas.push(matches[1]);
    
    } 
  } else {
    cleanOperas.push(opera)
  }
  return cleanOperas
}


console.log(extractOpera(str3))