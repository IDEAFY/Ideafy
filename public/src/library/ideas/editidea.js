define("EditIdea", ["Store", "Olives/OObject", "CouchDBStore", "Config", "Olives/Transport", "Map", "Olives/Model-plugin", "Olives/Event-plugin"], 
	function(Store, OObject, CouchDBStore, Config, Transport, Map, ModelPlugin, EventPlugin){
		
		return function EditIdeaConstructor(observer){
			
			
			var editIdea = new OObject();
			
			var editIdeaCDB = new CouchDBStore({});
			
			var dom = Map.get("editidea");
			
			var currentId;
			
			editIdeaCDB.setTransport(Config.get("Transport"));
			
			var texts = new Store({
				"legend": "Update your idea",
				"titlelbl": "*Title",
				"desclbl": "*Description",
				"sollbl": "Solution",
				"authorlbl": "Authored by: ",
				"datelbl": "Creation date: ",
				"modificationlbl": "Last modified: ",
				"savelbl": "Save"
				});
		
			editIdea.plugins.addAll({
				"editideatexts": new ModelPlugin(texts),
				"editideamodel": new ModelPlugin(editIdeaCDB,{
					formatDate: function(adate){
						if (adate) this.innerHTML = new Date(adate[0], adate[1], adate[2]).toDateString();
					},
					setVisibility: function(visibility){
						if (this.getAttribute("value") == visibility) this.setAttribute("checked", "checked");
					}
				}),
				"editideaevent": new EventPlugin(editIdea)
			});
			
			editIdea.cancel = function(event){
				event.preventDefault();
				observer.notify("display-idea", currentId);
			};
			
			editIdea.upload = function(event){
				event.preventDefault();
				var check = "true"; //used to verify if title and description have been provided
				var tElem = dom.querySelector('.input-ideatitle');
				var dElem = dom.querySelector('.input-ideadesc');			

				if (editIdeaCDB.get("title").length < 1){
					check = false;
					tElem.focus();
					tElem.setAttribute("placeholder", "Please enter a short title")
				}
				
				if (editIdeaCDB.get("description").length < 1){
					check = false;
					dElem.focus()
					dElem.setAttribute("placeholder", "Please describe your idea before submitting")
				}
				
				if (check) {
					// update modification date and time
					var now = new Date();
					editIdeaCDB.set("modification_date", [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]);
					
					// upload document in couchDB and reset UI content
					editIdeaCDB.upload().then(function(){
						observer.notify("display-idea", currentId);
						editIdeaCDB.unsync();
					});
				}
			};
			
			editIdea.changeVisibility = function(event, node){
				editIdeaCDB.set("visibility", node.getAttribute("value"));
			}
			
			
			// watch for new idea events
			observer.watch("edit-idea", function(id){
				editIdeaCDB.unsync();
				editIdeaCDB.reset({});
				currentId = id;
				editIdeaCDB.sync("taiaut", currentId);
			});

			editIdea.alive(dom);
			return editIdea;
		};
	});
