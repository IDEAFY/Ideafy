define("Map", ["Store"], function(Store){
	return new Store({
		"body" : document.body,
		"login" : document.getElementById("login"),
			"login-form" : document.getElementById("login-form"),
			"signup-form" : document.getElementById("signup-form"),
			"loading" : document.getElementById("loading"),
		"dock" : document.getElementById("wrapper"),
		"newidea-popup" : document.getElementById("newidea-popup"),
		"cache" : document.getElementById("cache"),
		"public" : document.getElementById("public"),
		        "public-menu" : document.getElementById("public-menu"),
			"public-detail" : document.getElementById("public-detail"),
			"public-writetwocents" : document.getElementById("public-writetwocents"),
			"public-twocents" : document.getElementById("public-twocents"),
			"public-edit" : document.querySelector("#public-detail .idea-edit"),
			"public-sendmail" : document.querySelector("#public-detail .idea-sendmail"),
		"brainstorm" : document.getElementById("brainstorm"),
		        "brainstorm-menu": document.getElementById("brainstorm-menu"),
		        "ideafy-menu": document.getElementById("ideafy-menu"),
		        "ideafy-quick": document.getElementById("ideafy-quick"),
		        "quickstart": document.getElementById("quickstart"),
		        "quicksetup": document.getElementById("quicksetup"),
		        "quickscenario": document.getElementById("quickscenario"),
		        "scenario-whiteboard": document.getElementById("scenario-whiteboard"),
		        "quicktech": document.getElementById("quicktech"),
		        "quickidea": document.getElementById("quickidea"),
		        "quickwrapup": document.getElementById("quickwrapup"),
		"library" : document.getElementById("library"),
		        "library-menu": document.getElementById("library-menu"),
		        "ideas" : document.getElementById("ideas"),
		        "ideas-detail" : document.getElementById("ideas-detail"),
		        "library-writetwocents" : document.getElementById("library-writetwocents"),
                        "library-twocents" : document.getElementById("library-twocents"),
                        "library-edit" : document.querySelector("#ideas-detail .idea-edit"),
                        "library-sendmail" : document.querySelector("#ideas-detail .idea-sendmail"),
		        "sessions" : document.getElementById("sessions"),
		        "decks" : document.getElementById("decks"),
		"connect" : document.getElementById("connect"),
		        "connect-menu": document.getElementById("connect-menu"),
		"dashboard" : document.getElementById("dashboard"),
		        "dashboard-menu": document.getElementById("dashboard-menu")
	});
});