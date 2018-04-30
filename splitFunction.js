function splitField(field){
	let array = []

	let splitted = field.split(" ");
	for (i=0;i<splitted.length;i++){
		
		let trimmed = splitted[i].substring(1, splitted[i].length-1);
		array.push(trimmed)
	}
	return array
}




console.log(splitField("<James> <Paul> <Estelle>"))
console.log(splitField("<one> <two three> <four>"))
// => ["one","two three", "four"]
