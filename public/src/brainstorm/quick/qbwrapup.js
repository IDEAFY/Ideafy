define("QBWrapup", ["Map", "Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "Config", "CouchDBStore", "Olives/Transport", "Utils"],
	function(Map,OObject, ModelPlugin, EventPlugin, Store, Config, CouchDBStore, Transport, Utils){
		
		return function QBWrapupConstructor(bObserver){
			
			var QBWrapup = new OObject();
			var results = new Store({"duration": null, "score": null, "ideaTitle": "", "scenarioTitle": ""});
			var ideas = [];
			var scenarios = [];
			var inputs = new Store([]);
			
			QBWrapup.plugins.addAll({
				"result": new ModelPlugin(results, {
					showtime : function(duration){
						this.innerHTML = Utils.formatDuration(duration);
						if (duration < 1200000) this.setAttribute("style", "color: green;");
						else if (duration >= 1200000 && duration < 3600000) this.setAttribute("style", "color: orange;");
						else this.setAttribute("style", "color: red;");
					}
				}),
				"input": new ModelPlugin(inputs, {
					setClass : function(type){
						switch(type){
							case "char":
								this.classList.add("smallcharactercard");
								break;
							case "context":
								this.classList.add("smallcontextcard");
								break;
							case "problem":
								this.classList.add("smallproblemcard");
								break;
							case "techno":
								this.classList.add("smalltechnocard");
								break;
						};
						((this.getAttribute("data-input_id")%2) == 0) ? this.classList.add("rotateup") : this.classList.add("rotatedown");
					}
				}),
				"event": new EventPlugin(QBWrapup)
			});
			
			var getCardsContent = function(inputs){
				
				// create array of doc ids
				var arr = [];
				inputs.loop(function(value, idx){
					arr.push(value.id);
				});
				
				// fetch documents on couchdb
				var cdb = new CouchDBStore();
				cdb.setTransport(Config.get("Transport"));
				cdb.sync("taiaut", {keys: arr}).then(function(){
					cdb.loop(function(value, idx){
						inputs.update(idx, "title", value.doc.title);
						inputs.update(idx, "picture_url", value.doc.picture_url);
						(value.doc.type == 1) ? inputs.update(idx, "category", value.doc.location) : inputs.update(idx, "category", value.doc.category);
					});
				});
			};
			
			var getWrapupData = function(store){
				
				// retrieve results info (duration / score / ideas / scenarios)
					results.set("duration", store.get("duration"));
					results.set("score", "not available");
					ideas = store.get("idea").concat();
					results.set("ideaTitle", ideas[0].title);
					scenarios = store.get("scenario").concat();
					results.set("scenarioTitle", scenarios[0].title);
					
				// update idea & scenario data (author & date)
					scenarios[0].authors = Config.get("user").get("_id");
					scenarios[0].authornames = Config.get("user").get("username");
					scenarios[0].date = store.get("date").concat();
					ideas[0].authors = Config.get("user").get("_id");
					ideas[0].authornames = Config.get("user").get("username");
					ideas[0].date = store.get("date").concat();
					
				// retrieve input cards ids and sort them to match with related scenario/idea
					
					for (i=0, l=ideas.length; i<l; i++){
						inputs.alter("push", {"id": store.get("characters")[i], "type":"char"});
						inputs.alter("push", {"id": store.get("contexts")[i], "type":"context"});
						inputs.alter("push", {"id": store.get("problems")[i], "type":"problem"});
						for (j=0, length=store.get("techno")[i].length; j<length; j++){
							inputs.alter("push", {"id": store.get("techno")[i][j], "type": "techno"});
						}
						getCardsContent(inputs);
					}
			};
			
			QBWrapup.displayIdea = function(event, node){
				Config.get("observer").notify("display-popup", "brainstorm", "idea", ideas[0]);
			};
			
			QBWrapup.displayScenario = function (event, node){
				Config.get("observer").notify("display-popup", "brainstorm", "scenario", scenarios[0]);
			};
			
			QBWrapup.zoom = function(event, node){
				var idx = node.getAttribute('data-input_id');
				Config.get("observer").notify("display-popup","brainstorm", inputs.get(idx).type, inputs.get(idx).id);
			};
			
			bObserver.watch("session-started", function(store){
				
				// reset inputs and outputs
				results.reset({"duration": null, "score": null, "ideaTitle": "", "scenarioTitle": ""});
				inputs.reset([]);
				// if we are in "replay" mode, the session is already finished: get and display the information
				if (store.get("step") ==  "wrapup") getWrapupData(store);
			});
			
			bObserver.watch("session-wrapup", function(store){
				getWrapupData(store);
			});
			
			QBWrapup.alive(Map.get("qbwrapup"));
			
			return QBWrapup;
			
		}
		
});
