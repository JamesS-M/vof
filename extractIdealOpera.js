let str1 = '<Le Sueur, Jean-François/Rousseau: Ode sacrée>'
let str2 = '<Grétry, André-Ernest-Modeste/Marmontel: Zemire und Azor, eine komische Operette in vier Akten, mit einer deutschen Uebersetzung in einem Klavierauszuge, hrsg. von Johann Adam Hiller, Leipzig: Schwickert 1783>'
let str3 = '<Salieri, Antonio/Coltellini: Armida, hrsg. von Carl Friedrich Cramer, Leipzig: Breitkopf 1783 (= Polyhymnia 1)>'


let extractIdealOpera = (opera) => {
  let cleanOpera = [];
  let pattern = /: (.*?)[\.-\>]/
  while(matches = pattern.exec(opera)) {
    cleanOpera.push(matches[1]);
    return cleanOpera
  }
}

console.log(extractIdealOpera(str3))