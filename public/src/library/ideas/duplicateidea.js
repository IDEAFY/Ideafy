define("DuplicateIdea", ["Store", "Olives/OObject", "CouchDBStore", "Config", "Olives/Transport", "Map", "Olives/Model-plugin", "Olives/Event-plugin"], 
	function(Store, OObject, CouchDBStore, Config, Transport, Map, ModelPlugin, EventPlugin){
		
		return function DuplicateIdeaConstructor(observer){
			
			
			var duplicateIdea = new OObject();
			
			var duplicateIdeaCDB = new CouchDBStore({});
			var originalIdeaCDB = new CouchDBStore({});
			
			var dom = Map.get("duplicateidea");
			
			var currentId;
			
			duplicateIdeaCDB.setTransport(Config.get("Transport"));
			originalIdeaCDB.setTransport(Config.get("Transport"));
			
			var texts = new Store({
				"legend": "Edit your copy",
				"titlelbl": "*Title",
				"desclbl": "Description",
				"sollbl": "Solution",
				"authorlbl": "Created by: ",
				"datelbl": "Creation date: ",
				"modificationlbl": "Last modified: ",
				"savelbl": "Save",
				"originallbl": "From original idea: "
				});
		
			duplicateIdea.plugins.addAll({
				"duplicateideatexts": new ModelPlugin(texts),
				"duplicateideamodel": new ModelPlugin(duplicateIdeaCDB,{
					formatDate: function(adate){
						if (adate) this.innerHTML = new Date(adate[0], adate[1], adate[2]).toDateString();
					},
					formatAuthors: function(authors){
						this.innerHTML = Config.get("user").get("username");
					},
					copyTitle: function(title){
						this.setAttribute("placeholder", title);
					}
				}),
				"duplicateideaevent": new EventPlugin(duplicateIdea)
			});
			
			var createCopy = function(){
				
				console.log(originalIdeaCDB.toJSON());
				var date = new Date();
				duplicateIdeaCDB.unsync();
				duplicateIdeaCDB.reset({
					"authors": [Config.get("user").get("_id")],
					"character": "",
					"context": "",
					"creation_date":[
				      	date.getFullYear(),
				      	date.getMonth(),
				      	date.getDate(),
				      	date.getHours(),
				      	date.getMinutes(),
				      	date.getSeconds()
				     	],
					"description": originalIdeaCDB.get("description"),
					"visibility": "private",
					"problem": originalIdeaCDB.get("problem"),
					"sessionid": "",
					"sharedwith": [],
					"solution": originalIdeaCDB.get("solution"),
					"techno": [],
					"title": "Copy of '" + originalIdeaCDB.get("title")+"'",
					"type": 6,
					"modification_date":null,
					"originalidea": originalIdeaCDB.get("_id"),
					"inspired_by": {
       					"authors": originalIdeaCDB.get("authors"),
       					"idea": originalIdeaCDB.get("title")
  						}
				});
				
			};
			
			duplicateIdea.cancel = function(event){
				event.preventDefault();
				observer.notify("display-idea", currentId);
			};
			
			duplicateIdea.upload = function(event){
				event.preventDefault();
				var check = "true"; //used to verify if title and description have been provided
				var tElem = dom.querySelector('.duplicate-ideatitle');			

				if ((duplicateIdeaCDB.get("title") )== "" || (duplicateIdeaCDB.get("title") == originalIdeaCDB.get("title"))){
					check = false;
					tElem.focus();
					tElem.setAttribute("placeholder", "Please enter a different title")
				}

				
				if (check) {
					// update modification date and time
					var now = new Date();
					var dupId = "I:"+now.getTime();
					duplicateIdeaCDB.sync("taiaut", dupId);					
					// upload document in couchDB and reset UI content
					duplicateIdeaCDB.upload().then(function(){
						observer.notify("display-idea", dupId);
					});
				}
			};

			
			// watch for new idea events
			observer.watch("duplicate-idea", function(id){
				originalIdeaCDB.unsync();
				originalIdeaCDB.reset();
				currentId = id;
				originalIdeaCDB.sync("taiaut", currentId).then(function(){createCopy()});
			});

			duplicateIdea.alive(dom);
			return duplicateIdea;
		};
	});
