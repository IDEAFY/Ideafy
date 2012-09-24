define("IdeaPopup", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", "Store", "CouchDBStore"],
	function(OObject, Map, Config, ModelPlugin, Store, CouchDBStore){
		
		return function IdeaPopupConstructor(){
			
			var idea = new Store({});
			var IdeaPopup = new OObject();
			
			IdeaPopup.plugins.add("model", new ModelPlugin(idea, {
				formatDate : function(date){
					this.innerHTML = new Date(date[0], date[1], date[2]).toDateString();	
				}
			}));
			
			Config.get("observer").watch("display-popup", function(origin, type, param){
				
				console.log(param);
				
				var ideaCDB = new CouchDBStore();
				if (typeof param === "object") {
				        idea.reset(param);
				}
				else {
				    ideaCDB.setTransport(Config.get("Transport"));
				    ideaCDB.sync("taiaut", "ideas", "_view/all", {key: '"'+param+'"', include_docs: true}).then(function(){
				            idea.reset(ideaCDB.get(0).doc);        
				    });        
				}
				console.log(idea.toJSON());
			});
			
			IdeaPopup.alive(Map.get("ideapopup"));
			
			return IdeaPopup;
			
		};
		
	});