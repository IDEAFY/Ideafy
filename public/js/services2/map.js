define("Map", ["Store"], function(Store){
	return new Store({
		"body" : document.body,
		"login" : document.getElementById("login"),
			"login-form" : document.getElementById("login-form"),
			"signup-form" : document.getElementById("signup-form"),
			"loading" : document.getElementById("loading"),
		"dock" : document.getElementById("wrapper"),
		"public" : document.getElementById("public"),
		        "public-menu" : document.getElementById("public-menu"),
			"public-detail" : document.getElementById("public-detail"),
			"public-twocents" : document.getElementById("idea-twocents"),
			"public-edit" : document.querySelector("#public-detail .idea-edit"),
			"public-sendmail" : document.querySelector("#public-detail .idea-sendmail"),
		"brainstorm" : document.getElementById("brainstorm"),
		        "brainstorm-menu": document.getElementById("brainstorm-menu"),
		        "ideafy-menu": document.getElementById("ideafy-menu"),
		"library" : document.getElementById("library"),
		        "library-menu": document.getElementById("library-menu"),
		        "ideas" : document.getElementById("ideas"),
		        "sessions" : document.getElementById("sessions"),
		        "decks" : document.getElementById("decks"),
		"connect" : document.getElementById("connect"),
		        "connect-menu": document.getElementById("connect-menu"),
		"dashboard" : document.getElementById("dashboard"),
		        "dashboard-menu": document.getElementById("dashboard-menu")
	});
});