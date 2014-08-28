/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var emily = require("../libs/emily"),
      Store = emily.Store;

var Map =  new Store({
		"body" : document.body,
		"login" : document.getElementById("login"),
			"login-form" : document.getElementById("login-form"),
			"signup-form" : document.getElementById("signup-form"),
			"loading" : document.getElementById("loading"),
			"serverdown" : document.getElementById("serverdown"),
			"nointernet" : document.getElementById("nointernet"),
	        "dock" : document.getElementById("wrapper"),
		"notify" : document.getElementById("notify"),
		"notify-popup" : document.getElementById("notify-popup"),
		"newidea-popup" : document.getElementById("newidea-popup"),
                "attachment-popup" : document.getElementById("attachment-popup"),
		"new2q-popup" : document.getElementById("new2q-popup"),
		"new2c-popup" : document.getElementById("new2c-popup"),
		"help-popup" : document.getElementById("help-popup"),
		"tip-popup" : document.getElementById("tip-popup"),
                "confirm-popup" : document.getElementById("confirm-popup"),
		"public" : document.getElementById("public"),
		        "public-menu" : document.getElementById("public-menu"),
			"public-detail" : document.getElementById("public-detail"),
			"public-writetwocents" : document.getElementById("public-writetwocents"),
			"public-twocents" : document.getElementById("public-twocents"),
			"public-edit" : document.querySelector("#public-detail .idea-edit"),
			"public-sendmail" : document.querySelector("#public-detail .idea-sendmail"),
			"public-share" : document.querySelector("#public-detail .idea-share"),
		"brainstorm" : document.getElementById("brainstorm"),
		        "brainstorm-menu": document.getElementById("brainstorm-menu"),
		        "ideafy-menu": document.getElementById("ideafy-menu"),
		        "ideafy-quick": document.getElementById("ideafy-quick"),
		        "ideafy-multi": document.getElementById("ideafy-multi"),
		        "quickstart": document.getElementById("quickstart"),
		        "mustart": document.getElementById("mustart"),
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
		        "library-idea" : document.querySelector("library-idea"),
		        "library-writetwocents" : document.getElementById("library-writetwocents"),
                        "library-twocents" : document.getElementById("library-twocents"),
                        "library-edit" : document.querySelector("#ideas-detail .idea-edit"),
                        "library-sendmail" : document.querySelector("#ideas-detail .idea-sendmail"),
                        "library-share" : document.querySelector("#ideas-detail .idea-share"),
		        "sessions" : document.getElementById("sessions"),
		        "decks" : document.getElementById("decks"),
		        "decklist" : document.getElementById("decklist"),
		        "deckview" : document.getElementById("deckview"),
		"connect" : document.getElementById("connect"),
		        "connect-menu": document.getElementById("connect-menu"),
		        "connect-messages": document.getElementById("connect-messages"),
		        "msgdetail": document.getElementById("msgdetail"),
		        "connect-contacts": document.getElementById("connect-contacts"),
		        "contactdetails": document.getElementById("contactdetails"),
		        "connect-twocents": document.getElementById("connect-twocents"),
		"dashboard" : document.getElementById("dashboard"),
		        "dashboard-menu": document.getElementById("dashboard-menu"),
		        "dashboard-profile": document.getElementById("dashboard-profile"),
		        "leaderboard": document.getElementById("leaderboard"),
		        "dashboard-settings": document.getElementById("dashboard-settings"),
		        "dashboard-about": document.getElementById("dashboard-about")
	});

module.exports = Map;