/*
 * Config contains global parameters used by the application
 */

define("Config", ["Olives/LocalStore", "CouchDBStore", "Olives/Transport", "Observable", "Store"], 
	function(LocalStore, CouchDBStore, Transport, Observable, Store) {
		
		var config = new LocalStore({
                        observer : new Observable(),
                        
                        // used to display introduction to applications and/or highlight tutorial
                        firstStart: false,
                        login: {"id": ""},
        
                        user: new CouchDBStore({"lastname": "",
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
                                        "picture_file": "images/userpics/deedee0.png",
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
                                        }),
                        uid: "",
                        // a store to save locally user pictures and avatars (key:userid / value: base64-encoded picture)
                        avatars : new Store({}),
                        startupbg : {
                                path: "/images/startup/",
                                files: ["bg1.jpg", "bg2.jpg", "bg3.jpg", "bg4.jpg", "bg5.jpg", "bg6.jpg", "bg7.jpg"]
                        }
                }),
                transport = new Transport(io, location.href),
                autoSave = function(interval){
                        setInterval(function(){config.sync("Ideafy");}, interval);
                };
		
		config.sync("Ideafy");
		config.set("Transport", transport);
		console.log(config.toJSON());
		autoSave(60000);
		
		return config;
	}
);


/*
 * AppData defines a set of data used by the application
 */

define("AppData", ["Olives/LocalStore", "Store"],
	function(LocalStore, Store){
	
		return new LocalStore({
			family_status:["single", "married", "divorced", "widow"],
			achievements: new Store([
			        {id: "profilecomplete", detail: {title: "You know yourself", text: "You completed your profile!", picture: "images/badges/deedeecup.png", reward: 500}, done: false},
			        {id: "playthegame", detail: {title: "Play the game", text: "You created a character out of your profile!", picture: "images/badges/deedeecup.png", reward: 1000}, done: false},
			        {id: "tutorialcomplete", detail: {title: "It's a start", text: "You completed the tutorial!", picture: "images/badges/deedeecup.png", reward: 200}, done: false},
			        {id: "ideas5", detail: {title: "You're an amateur", text: "You entered 5 ideas!", picture: "images/badges/deedeecup.png", reward: 250}, done: false},
			        {id: "ideas25", detail: {title: "You're an innovator", text: "You entered 25 ideas!", picture: "images/badges/deedeecup.png", reward: 1000}, done: false},
			        {id: "ideas100", detail: {title: "You're a true ideafyer", text: "You entered 100 ideas!", picture: "images/badges/deedeecup.png", reward: 5000}, done: false},
			        {id: "ideas250", detail: {title: "You're a ... a Genius!", text: "You entered 250 ideas!", picture: "images/badges/deedeecup.png", reward: 50000}, done: false},
			        {id: "silverspark", detail: {title: "You got the Silver Spark", text: "You obtained 100 votes and a minimum of 3,5/5 rating on one of your ideas", picture: "images/badges/deedeecup.png", reward: 5000}, done: false},
			        {id: "silverflame", detail: {title: "You got the Silver Flame", text: "You obtained 500 votes and a minimum of 4/5 rating on one of your ideas", picture: "images/badges/deedeecup.png", reward: 20000}, done: false},
			        {id: "goldenflame", detail: {title: "You got the Golden Flame", text: "You obtained 1 000 votes and a minimum of 4,5/5 rating on one of your ideas", picture: "images/badges/deedeecup.png", reward: 100000}, done: false},
			        {id: "platinumflame", detail: {title: "You got the Platinum Flame", text: "You placed one of your ideas in the top 100 (min 500 votes)", picture: "images/badges/deedeecup.png", reward: 25000}, done: false},
			        {id: "platinumwildfire", detail: {title: "You got the Platinum Wildfire", text: "You placed one of your ideas in the top 10 (min 500 votes)", picture: "images/badges/deedeecup.png", reward: 200000}, done: false},
			        {id: "easybrainstormer", detail: {title: "You're an Easy Brainstormer", text: "You completed 5 single user sessions", picture: "images/badges/deedeecup.png", reward: 250}, done: false},
			        {id: "mindstormer",  detail: {title: "You're a Mindstormer", text: "You completed 20 single user sessions", picture: "images/badges/deedeecup.png", reward: 2000}, done: false},
			        {id: "mastermindstormer", detail: {title: "You're an Mastermindstormer", text: "You completed 5O single user sessions", picture: "images/badges/deedeecup.png", reward: 5000}, done: false},
			        {id: "guide", detail: {title: "Follow the guide", text: "You managed 5 multi-user sessions", picture: "images/badges/deedeecup.png", reward: 500}, done: false},
			        {id: "leader", detail: {title: "Follow the lead", text: "You managed 10 multi-user sessions", picture: "images/badges/deedeecup.png", reward: 2000}, done: false},
			        {id: "mindweaver", detail: {title: "You're a Mindweaver", text: "You managed 25 multi-user sessions", picture: "images/badges/deedeecup.png", reward: 10000}, done: false},
			        {id: "opinionator", detail: {title: "You're an Opinionator", text: "You submitted 50 2cents", picture: "images/badges/deedeecup.png", reward: 50}, done: false},
			        {id: "feedbackartist", detail: {title: "You're a feedback artist", text: "You submitted 100 2cents", picture: "images/badges/deedeecup.png", reward: 600}, done: false},
			        {id: "chatterbox", detail: {title: "You're a real chatterbox", text: "You submitted 1 000 2cents", picture: "images/badges/deedeecup.png", reward: 7500}, done: false},
			        {id: "allday", detail: {title: "Is taht what you do all day?", text: "You submitted 5 000 2cents", picture: "images/badges/deedeecup.png", reward: 50000}, done: false},
			        {id: "curious", detail: {title: "You are curious", text: "You asked 5 2questions", picture: "images/badges/deedeecup.png", reward: 100}, done: false},
			        {id: "puzzled", detail: {title: "You seem ... puzzled", text: "You asked 15 2questions", picture: "images/badges/deedeecup.png", reward: 1000}, done: false},
			        {id: "whyarewehere", detail: {title: "Why are we here?", text: "You asked 50 2questions", picture: "images/badges/deedeecup.png", reward: 2000}, done: false}
			]),
			ranks: new Store([
			        {name: "apprentice", title: "Ideafy Apprentice", color: "white", ipmin: 200, maxrank: null},
			        {name: "companion", title: "Ideafy Companion", color: "yellow", ipmin: 700, maxrank: null},
			        {name: "veteran", title: "Ideafy Veteran", color: "orange", ipmin: 3300, maxrank: null},
			        {name: "specialist", title: "Ideafy Specialist", color: "green", ipmin: 33000, maxrank: null},
			        {name: "expert", title: "Ideafy Expert", color: "blue", ipmin: 333000, maxrank: null},
			        {name: "master", title: "Ideafy Master", color: "brown", ipmin: 3333000, maxrank: null},
			        {name: "grandmaster", title: "Ideafy Grandmaster", color: "black", ipmin: 10000000, maxrank: null}
			]),
			honours: new Store([
			        {name: "premium", title: "Premium Ideafyer", style: "yellow", ipmin: 3300, maxrank: 500},
			        {name: "firstclass", title: "First class Ideafyer", style: "yellow", ipmin: 33000, maxrank: 100},
			        {name: "elite", title: "Elite Ideafyer", style: "yellow", ipmin: 333000, maxrank: 25},
			        {name: "pretender", title: "Pretender", style: "yellow", ipmin: 3300, maxrank: 3},
			        {name: "viceking", title: "Vice-King of Ideas", style: "yellow", ipmin: 3300, maxrank: 2},
			        {name: "king", title: "King of Ideas", style: "yellow", ipmin: 3300, maxrank: 1}
			])
		});
	});


/*
 * Param defines a set of parameters that can be customized by users
 */

define("Param", ["Olives/LocalStore"],
	function(LocalStore){
	
		return new LocalStore({
			"defaultDeck":"DEMO-FR",
			"currentDeck": "DEMO-FR",
			"continueSession": false,
			"quickB": {
				"steps": ["setup", "craft1", "scenario", "tech", "craft2", "idea"],
				"timers": [120000, 300000, 240000, 60000, 300000, 300000],
				"labels": ["Setting up a situation", "Crafting a story", "SCENARIO", "Drawing technologies", "Crafting a solution", "IDEA"],
				"nbTech": 3,
				"scoring": null
			}
		});
	
	});


/*
 * Map proposes a "site map" of the application and allows to manipulate dom elements with aliases
 */

define("Map", ["Store"], 
	function(Store) {
 		return new Store({
 			container : document.querySelector(".container"),
 			startup : document.querySelector(".startup"),
 			login: document.querySelector(".login"),
 			signup: document.querySelector(".signup"),
 			userinfo: document.querySelector(".userinfo"),
 			defaultlogin: document.querySelector(".defaultlogin"),
 			signupscreen: document.querySelector(".signupscreen"),
 			newuser: document.querySelector(".newuser"),
 			returninguser: document.querySelector(".returning-user"),
 			library : document.querySelector(".library"),
 			libraryHeader : document.querySelector(".library-header"),
 			libraryContent : document.querySelector(".library-content"),
 			ideas : document.querySelector(".ideas"),
 			idealiststack : document.querySelector(".idealiststack"),
 			idealistheader : document.querySelector(".idealistheader"),
 			ideacontentstack : document.querySelector(".ideacontentstack"),
 			userbydate: document.querySelector(".userbydate"),
 			userbyname: document.querySelector(".userbyname"),
 			browsebydate: document.querySelector(".browsebydate"),
 			browsebyname: document.querySelector(".browsebyname"),
 			searchuserbydate: document.querySelector(".searchuserbydate"),
 			searchuserbyname: document.querySelector(".searchuserbyname"),
 			searchpublicbydate: document.querySelector(".searchpublicbydate"),
 			searchpublicbyname: document.querySelector(".searchpublicbyname"),
 			newidea: document.querySelector(".newidea"),
 			displayidea: document.querySelector(".displayidea"),
 			editidea: document.querySelector(".editidea"),
 			ideaoptions: document.querySelector(".ideaoptions"),
 			ideapopup: document.querySelector(".ideacardpopup"),
 			largeideacard: document.querySelector(".largeideacard"),
 			decks : document.querySelector(".decks"),
 			activedeck : document.querySelector(".activedeck"),
 			decklist: document.querySelector(".decklist"),
 			deckcontentheader: document.querySelector(".deckcontentheader"),
 			deckcontentstack : document.querySelector(".deckcontentstack"),
 			deckoverview: document.querySelector(".deckoverview"),
 			deckcharacters: document.querySelector(".deckcharacters"),
 			deckcontexts: document.querySelector(".deckcontexts"),
 			deckproblems: document.querySelector(".deckproblems"),
 			decktechno: document.querySelector(".decktechno"),
 			sessions : document.querySelector(".sessions"),
 			brainstorm : document.querySelector(".brainstorm"),
 			brainstormcontentstack : document.querySelector(".brainstormcontentstack"),
 			bmenu : document.querySelector(".brainstormmenu"),
 			quickbrainstormingstack : document.querySelector(".quickbrainstormingstack"),
 			qbheader: document.querySelector(".qbheader"),
 			qbcontentstack: document.querySelector(".qbcontentstack"),
 			qbstart: document.querySelector(".qbstart"),
 			qbsetup: document.querySelector(".qbsetup"),
 			qbcraft1: document.querySelector(".qbcraft1"),
 			qbscenario: document.querySelector(".qbscenario"),
 			qbtech: document.querySelector(".qbtech"),
 			qbcraft2: document.querySelector(".qbcraft2"),
 			qbidea: document.querySelector(".qbidea"),
 			qbwrapup: document.querySelector(".qbwrapup"),
 			connect : document.querySelector(".connect"),
 			socialcontent : document.querySelector(".socialcontent"),
 			connections : document.querySelector(".connections"),
 			contactbox : document.querySelector(".contactbox"),
 			contactcontentbox : document.querySelector(".contactcontentbox"),
 			innercontactstack : document.querySelector(".innercontactstack"),
 			contactmiscinfo : document.querySelector(".contactmiscinfo"),
 			contactnotes : document.querySelector(".contactnotes"),
 			contactdashboard : document.querySelector(".contactdashboard"),
 			contactwhatsnew : document.querySelector(".contactwhatsnew"),
 			contactdetails : document.querySelector(".contactdetails"),
 			groupdetails : document.querySelector(".groupdetails"),
 			addcontact : document.querySelector(".addcontact"),
 			contactshare : document.querySelector(".contactshare"),
 			msgcenter : document.querySelector(".msgcenter"),
 			messagebox : document.querySelector(".messagebox"),
 			msgliststack : document.querySelector(".msgliststack"),
 			allmessages : document.querySelector(".allmessages"),
 			mplist : document.querySelector(".mplist"),
 			notifications : document.querySelector(".notifications"),
 			unread : document.querySelector(".unread"),
 			messagecontentbox : document.querySelector(".messagecontentbox"),
 			nomsgselected : document.querySelector(".nomsgselected"),
 			messagedetails : document.querySelector(".messagedetails"),
 			compose : document.querySelector(".compose"),
 			twocents : document.querySelector(".twocents"),
 			dashboard : document.querySelector(".dashboard"),
 			dashboardcontent : document.querySelector(".dashboardcontent"),
 			userprofile : document.querySelector(".userprofile"),
 			profilecontentstack : document.querySelector(".profilecontentstack"),
 			innerprofilestack : document.querySelector(".innerprofilestack"),
 			userdata: document.querySelector(".userdata"),
 			userjob: document.querySelector(".userjob"),
 			userhobbies: document.querySelector(".userhobbies"),
 			userinterests: document.querySelector(".userinterests"),
 			profiledetails : document.querySelector(".profiledetails"),
 			stats : document.querySelector(".stats"),
 			achievements : document.querySelector(".achievements"),
 			leaderboard : document.querySelector(".leaderboard"),
 			settings : document.querySelector(".settings"),
 			about : document.querySelector(".about"),
 			aboutstack : document.querySelector(".aboutstack"),
 			userguide: document.querySelector(".userguide"),
 			faq: document.querySelector(".faq"),
 			support: document.querySelector(".support"),
 			eula: document.querySelector(".eula"),
 			credits: document.querySelector(".credits"),
 			popups: document.querySelector(".popups"),
 			popupstack: document.querySelector(".popupstack"),
 			charpopup: document.querySelector(".charpopup"),
 			cardpopup: document.querySelector(".cardpopup"),
 			scenariopopup: document.querySelector(".scenariopopup"),
 			ideapopup: document.querySelector(".ideapopup")	
 		});
 	}
 );

/*
 * Stack defines a simple stack mechanism to alternate display between multiple UI elements 
 */

define("Stack", ["Olives/OObject", "Store"],
	function(OObject, Store){
		return function TabsContentConstructor(dom) {
			var store = new Store(),
				current = null;

			var content = new OObject(store);

			content.add = function(name, ui) {
				ui.place(document.createDocumentFragment());
				store.set(name, ui);
			};

			content.addAll = function(array) {
				for(item in array) {
					content.add(item, array[item]);
				}
			};

			content.show = function(name) {
				var ui = store.get(name);
				current && current.place(document.createDocumentFragment());
				current = ui;
				current.place(dom);
			};

			content.alive(dom);
			return content;
		};
	}
);

/*
 * Utils offers a set of functions used throughout the application.
 */

define("Utils", ["CouchDBStore", "Transport", "Config", "Param", "Observable", "AppData"], 
	function (CouchDBStore, Transport, Config, Param, Observable, AppData){
		
		var objectCopy = function(object){
			var copy = (object instanceof Array)? [] : {};
			for (i in object){
				if (object[i] && typeof object[i] == "object"){
					copy[i] = objectCopy(object[i]);
				}
				else copy[i] = object[i];
			};
			return copy;
		};
		
		return {
			
			/*
			 * A function to generate an html list from an array of data
			 */
			arrayToHTML : function(array){
				
				var list;
				for (i=0, l=array.length; i<l; i++){
					list = "<li>"+array[i]+"</li>";
				};
				return ("<ul>"+list+"</ul>");
				
			},
			
			/* 
			 * A function to display an abtract in a list, stopping at the end of the first sentence or truncating it if it
			 * goes beyond 140 characters
			 */
			displayFirstSentence : function(elementid, desc){
				var sentences = [];
				sentences = desc.split("."[0], 1);
				if (sentences[0].length > 140) {
					elementid.innerHTML = sentences[0].substr(0,139).replace(/\w*\s(\S)*$/, ' ...');					
				}
				else elementid.innerHTML = sentences[0]+'...';
				return elementid.innerHTML;
			},
			
			/*
			 * A function used to format a duration in days, hours, min and secs from a number of milliseconds
			 */
			
			formatDuration : function(duration){
				var d = Math.round(duration/1000);
				var days, hrs, min, sec, res;
				days = Math.floor(d / 86400);
				hrs = Math.floor(d % 86400 / 3600);
				min = Math.floor(d % 86400 % 3600 / 60);
				sec = Math.floor(d % 86400 % 3600 % 60);
				days>0 ? res = days+"d ": res="";
				hrs>0 ? res += hrs+":" : res+="";
				min>0 ? res += (hrs>0 && min<10 ? "0":"")+min+":" : "0:";
				sec<10 ? res += "0"+sec : res+= sec;
						
				return res;
			},
			
			/**
			 * A function to retrieve images from the server
			 * @Param {String} url the URL of the picture to retrieve
			 * @Returns data base 64 encoded data
			 */
			getAvatar : function(uid, filename){
			         var request = new XMLHttpRequest(),
			             url = "attachments/"+filename,
			             image,
			             dlOk = new Observable();
			             
			         // if no avatar is defined assign deedee0 by default
			         if (!filename || filename.length<2){
			             image = "images/userpics/deedee0.png";
			             Config.get("avatars").set(uid, image);       
			         }
			         // if user is using one of the default avatars, then keep image reference as is
			         else if (filename.search("images/userpics")>-1){
			                 Config.get("avatars").set(uid, filename);
			         }
			         // else check if filename is appropriate and attempt to retrieve file from server
			         else if (typeof filename === "string"){			         
			             request.open("GET", url);
			             request.onreadystatechange = function(){
			                 if (request.readyState === 4){
			                     if (request.status === 200){
			                             image = request.responseText;
			                     }
			                     else {
			                             // fallback in case of network error or download failure
			                             image = "images/userpics/deedee0.png";
			                     }
			                     dlOk.notify("avatar-loaded", uid);
			                 }
			             };
			             request.send(null);
			         }
			         else {
			                 // filename should be a number > 0
			                 image = "images/userpics/deedee"+filename+".png";
			                 Config.get("avatars").set(uid, image); 
			         }
			         test = Config.get("avatars");
			         
			         dlOk.watch("avatar-loaded", function(uid){
			                 Config.get("avatars").set(uid, image);
			                 Config.get("observer").notify("avatar-loaded", uid);
			        });
			          
			},
                        
                        /*
                         * A function to get a user's rank based on the number of Ideafy Points
                         */
                        getRank : function(ip){
                          
                                var res = -1;
                                AppData.get("ranks").loop(function(value, index){
                                        if (ip >= value.ipmin)  {
                                                res++;
                                        }       
                                });
                                return AppData.get("ranks").get(res);
                        },			
			
			/*
			 * A function used to initialize a brainstorming session document in couchDB
			 */
			initBSession : function(type){
				var session = new CouchDBStore({});
				session.setTransport(Config.get("Transport"));
				
				var now = new Date();
				var id = "S:" + now.getTime();
				session.reset({
					"title": "",
					"initiator": Config.get("user").get("_id"),
					"participants": [],
					"date": [now.getFullYear(), now.getMonth(), now.getDate()],
					"mode": type,
					"type": 8,
					"deck": Param.get("currentDeck"),
					"status": "ongoing",
					"step": "start"
				});
				session.sync("taiaut", id);
				session.upload();
				return id;
			},
			
			/* 
			 * A function to create object clones
			 */
			objectCopy : objectCopy,
			
			/*
			 * A function to display idea ratings
			 */
			
			setRating : function(node, rating){
				
				var img0 = "<img src = '/images/library/icon-gland-empty.png'>";
				var img05 = "<img src = '/images/library/icon-gland-half.png'>";
				var img1 = "<img src = '/images/library/icon-gland-full.png'>";
				var res = "<ul>";
				
				if (!rating){
					
					for (i=0; i<5; i++){
						res = res + "<li>"+img0+"</li>"
					};
					
				}
				
				else {
					var i=0;
					while (i<Math.floor(rating)){
						res = res + "<li>"+img1+"</li>";
						i++;
					};
					if (i<5) {
						Math.round(rating-Math.floor(rating)) ? res = res+"<li>"+img05+"</li>" : res = res+"<li>"+img0+"</li>";
						i++;
					};
					while(i<5){
						res = res + "<li>"+img0+"</li>";
						i++
					};
				}
				
				node.innerHTML = res+"</ul>";
				
				
			},
			
			/*
			 * a tool to toggle a class on and off
			 */
			toggleClass: function ( value, className ) {
				value ? this.classList.add( className ) : this.classList.remove( className );
			},
			
			/*
			 * A function that truncates text (stops at a full word and adds ...)
			 */
			truncate : function(elementid, desc) {
				
				elementid.innerHTML = desc;
				
				while (elementid.scrollHeight > elementid.offsetHeight) {
					var text = elementid.innerHTML;
					elementid.innerHTML= text.replace(/\W*\s(\S)*$/, '...');
				}
				return elementid.innerHTML;
			},
			/**
			 * A function to upload one or more files on the server
			 * @Param {String} url the URL to send the file ot
			 * @Param {Object} file the file to upload
			 * @Param {HTMLElement} progressUI the element that displays upload progress
			 * @Param {function} onEnd the callback when the request is complete
			 */
			uploadFile : function(url, file, progressUI, onEnd){
			        if (typeof FormData ===  "undefined") throw new Error("FormData is not implemented");
			        
			     var req = new XMLHttpRequest(),
			         body = new FormData();
			     
			     console.log(url, file, progressUI);
			     
			     req.open('POST', url);
			     
			     req.onreadystatechange = function(){
			             if(req.readyState === 4 && onEnd){
			                     onEnd(req);
			             }
			     };
			     
			     req.upload.onprogress = function(e){
			             if(e.lengthComputable){
			                     progressUI.innerHTML = "upload" + Math.round(e.loaded/e.total*100) + "% complete";
			             }
			     };
			     
			     //pass the userid along with the file in the body
			     body.append(Config.get("user").get("_id"), file);
			     
			     req.send(body);
			     
			             
			},
			
			uploadSessionOutput : function(type, json, idx){
				
				var cdbStore = new CouchDBStore({});
				cdbStore.setTransport(Config.get("Transport"));
				var doc = JSON.parse(json);
				var date = new Date();
				
				switch(type){
					case "scenario":
						var id = "SC:" + date.getTime();
						cdbStore.reset({
							"authors": [doc.initiator.id].concat(doc.participants),
							"authornames": doc.authornames,
							"character": doc.characters[idx],
							"context": doc.contexts[idx],
							"creation_date":[
                                                                date.getFullYear(),
                                                                date.getMonth(),
                                                                date.getDate(),
                                                                date.getHours(),
                                                                date.getMinutes(),
                                                                date.getSeconds()
                                                        ],
							"story": doc.scenario[idx].story,
							"problem": doc.problems[idx],
							"sessionid": doc.sessionid,
							"sharedwith": [],
							"solution": doc.scenario[idx].solution,
							"title": doc.scenario[idx].title,
							"type": 5
						});
						break;
						
					case "idea":
						var id = "I:" + date.getTime();
						cdbStore.reset({
							"authors": [doc.initiator.id].concat(doc.participants),
							"authornames": doc.authornames,
							"character": doc.characters[idx],
							"context": doc.contexts[idx],
							"creation_date":[
                                                                date.getFullYear(),
                                                                date.getMonth(),
                                                                date.getDate(),
                                                                date.getHours(),
                                                                date.getMinutes(),
                                                                date.getSeconds()
                                                        ],
							"description": doc.idea[idx].description,
							"visibility": doc.idea[idx].visibility,
							"problem": doc.problems[idx],
							"sessionid": doc.sessionid,
							"sharedwith": [],
							"solution": doc.idea[idx].solution,
							"techno": doc.techno[idx].concat(),
							"title": doc.idea[idx].title,
							"type": 6,
							"modification_date":[],
							"inspired_by": ""
						});
						break;
				};
				cdbStore.sync("taiaut", id);
				cdbStore.upload();
			}
		}
	});

/*
 * SyncUtils provides a set of functions used to synchronize local and couch databases
 */

define("SyncUtils", ["Olives/LocalStore", "CouchDBStore", "Olives/Transport", "Utils", "Config"],
	function(LocalStore, CouchDBStore, Transport, Utils, Config){
		
		return {
			
			cdbDocToLS : function(docId, localStore){
				
				var couchDBStore = new CouchDBStore();
				couchDBStore.setTransport(Config.get("Transport"));
				
				couchDBStore.sync("taiaut", docId).then(function(doc){
					localStore.reset(Utils.objectCopy(doc));
				});
			},
			
			lsDocToCDB : function(localStore){
				var doc = Utils.objectCopy(localStore);
				var id = doc.get("_id");
				
				
				// delete _id field to avoid conflicts
				doc.del("_id");
				console.log("doc.toJSON", doc.toJSON());
				
				// upload
				var couchDBStore = new CouchDBStore();
				couchDBStore.setTransport(Config.get("Transport"));
				couchDBStore.sync("taiaut", id);
				couchDBStore.reset(JSON.parse(doc.toJSON()));
				couchDBStore.upload().then(function(){
					console.log(couchDBStore.getSyncInfo());
					console.log("couchDBStore", couchDBStore.toJSON());
				});
			}
			
		}
		
	});
