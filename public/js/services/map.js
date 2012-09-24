define("Map", ["Store"], function(Store){
	return new Store({
		wrapper : document.getElementById("wrapper"),
		login : document.getElementById("login"),
		signup : document.getElementById("signup"),
		publicIdeas : document.getElementById('public'),
		wall : document.getElementById("wall"),
		idea : document.getElementById("ideaDetails")
	});
});