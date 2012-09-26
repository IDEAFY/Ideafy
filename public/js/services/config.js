define("Config", ["Store", "Olives/Transport", "Observable", "CouchDBStore"], function(Store, Transport, Observable, CouchDBStore){
	
	 var userTemplate = {
                "lastname": "",
                "firstname": "",
                "address": {"street1": "", "street2": "", "zip code": null, "city": "", "country": ""},
                "gender": 1,
                "lang": "US",
                "birthdate": [],
                "connections": [],
                "taiaut_decks": ["INT"],
                "custom_decks": [],
                "occupation": { "description": "", "details": {"situation": "", "job": "", "organization": ""}},
                "family": {"couple": null, "children": null},
                "leisure_activities": [{"name": "", "comment": ""}, {"name": "", "comment": ""}, {"name": "", "comment": ""} ],
                "interests": [{"name": "", "comment": ""}, {"name": "", "comment": "" }],
                "useascharacter": 0,
                "type": 7,
                "notifications": [],
                "facebook": "",
                "twitter": "",
                "username": "",
                "sessionInProgress": {},
                "organization": "",
                "groups": [],
                "rated": [],
                "rated_ideas": [],
                "favorites": [],
                "ip": 0,
                "picture_file": "img/userpics/deedee0.png",
                "title": null,
                "achievements": [],
                "ideas_count": 0,
                "su_sessions_count": 0,
                "twocents_count": 0,
                "twoquestions_count": 0,
                "tutorial_complete": false,
                "profile_complete": true,
                "news": [],
                "twocents": [],
                "twoquestions": []
                },
           defaultLabels = {
                "language": "US",
                "emailplaceholder": "Email",
                "passwordplaceholder": "Password",
                "repeatpasswordplaceholder": "Confirm password",
                "loginbutton": "Log in",
                "newuserbutton": "New user",
                "invalidlogin": "Invalid username or password",
                "missingloginparam": "Please enter both username and password or register",
                "signupmissingemail": "Please enter your email address in the field above",
                "signupmissingpwd": "A password is required",
                "signupmissingpwdok": "Please confirm your password",
                "signupmissingfn": "Please enter your first name",
                "signupmisingln": "Please enter your last name",
                "signupinvalidemail": "Invalid email address",
                "signuppwdnomatch": "Passwords do not match",
                "signupwelcomeobject": "Welcome to Ideady",
                "signupwelcomebody": "Thank you for trying Ideafy. We hope you'll enjoy it. We designed it so you can manage ideas that matter to you or just play around. But don't keep what you're doing to yourself.",
                "signupbutton": "Sign up",
                "firstnameplaceholder": "First name",
                "lastnameplaceholder": "Last name",
                "publicideasheadertitle": "Public Ideas",
                "ideadetailsheadertitle": "Idea Overview"
                };
	
	return new Store({
		transport : new Transport(io, location.href),
		userTemplate: userTemplate,
		// language
		language: "",
		defaultLabels: defaultLabels,
		labels: new Store({}),
		// a store to save locally user pictures and avatars (key:userid / value: base64-encoded picture)
                avatars : new Store({}),
                observer : new Observable(),
                user : new CouchDBStore()
	});
});

 