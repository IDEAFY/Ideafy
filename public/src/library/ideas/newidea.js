define("NewIdea", ["Store", "Olives/OObject", "CouchDBStore", "Config", "Olives/Transport", "Map", "Olives/Model-plugin", "Olives/Event-plugin"], 
	function(Store, OObject, CouchDBStore, Config, Transport, Map, ModelPlugin, EventPlugin){
		
		return function NewIdeaConstructor(observer){
			
			
			var newIdea = new OObject();
			
			var newIdeaCDB = new CouchDBStore({});
			
			var dom = Map.get("newidea");
			
			newIdeaCDB.setTransport(Config.get("Transport"));
			
			var texts = new Store({
				"legend": "Enter a new idea",
				"titlelbl": "*Title",
				"desclbl": "*Description",
				"sollbl": "Solution",
				"authorlbl": "Authored by: ",
				"datelbl": "Creation date: ",
				"modificationlbl": "",
				"savelbl": "Save"
				});
		
			newIdea.plugins.addAll({
				"newideatexts": new ModelPlugin(texts),
				"newideamodel": new ModelPlugin(newIdeaCDB,{
					formatDate: function(creadate){
						if (creadate) this.innerHTML = new Date(creadate[0], creadate[1], creadate[2]).toDateString();
					},
					formatAuthors: function(authors){
						if (authors) this.innerHTML = Config.get("user").get("username");
					},
					setVisibility: function(visibility){
						if (this.getAttribute("value") == visibility) this.setAttribute("checked", "checked");
					}
				}),
				"newideaevent": new EventPlugin(newIdea)
			});
			
			newIdea.cancel = function(event){
				event.preventDefault();
				newIdea.reset();
			};
			
			newIdea.upload = function(event){
				event.preventDefault();
				var check = "true"; //used to verify if title and description have been provided
				var tElem = dom.querySelector('.input-ideatitle');
				var dElem = dom.querySelector('.input-ideadesc');			

				if (newIdeaCDB.get("title").length < 1){
					check = false;
					tElem.focus();
					tElem.setAttribute("placeholder", "Please enter a short title")
				}
				
				if (newIdeaCDB.get("description").length < 1){
					check = false;
					dElem.focus()
					dElem.setAttribute("placeholder", "Please describe your idea before submitting")
				}
				
				if (check) {
					// update creation date and time
					var now = new Date();
					var id = "I:" + now.getTime();
					newIdeaCDB.set("creation_date", [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]);
					newIdeaCDB.sync("taiaut", id);
					
					// upload document in couchDB and reset UI content
					newIdeaCDB.upload().then(function(){
						observer.notify("display-idea", id);
						newIdeaCDB.unsync();
					});
				}
			};
			
			newIdea.reset = function(){
				var date = new Date();
				newIdeaCDB.reset({
					"authors": [Config.get("user").get("_id")],
					"authornames": Config.get("user").get("username"),
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
					"description": "",
					"visibility": "private",
					"problem": "",
					"sessionid": "",
					"sharedwith": [],
					"solution": "",
					"techno": [],
					"title": "",
					"type": 6,
					"modification_date":[],
					"inspired_by": ""
				});
			};
			
			newIdea.changeVisibility = function(event, node){
				newIdeaCDB.set("visibility", node.getAttribute("value"));
			};
			
			
			// watch for new idea events
/*			observer.watch("create-newidea", function(){
				newIdeaCDB.unsync();
				newIdea.reset();
			});
*/			
			observer.watch("display-new", function(){
				newIdeaCDB.unsync();
				newIdea.reset({});
			});

			newIdea.reset({});
			newIdea.alive(dom);
			return newIdea;
		};
	});
