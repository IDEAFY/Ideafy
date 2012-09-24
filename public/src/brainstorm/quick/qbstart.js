define ("QBStart", ["Olives/OObject", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin"],
	function(OObject, Map, Store, ModelPlugin, EventPlugin){
	
		return function QBStartConstructor(bObserver){
			
			var QBStart = new OObject();
			var store = new Store({});
			
			QBStart.plugins.addAll({
				"model": new ModelPlugin(store, {
					setReadOnly : function(bool){
						(bool) ? this.removeAttribute("readonly") : this.setAttribute("readonly", "readonly");
					},
					setVisible : function(bool){
						(bool) ? this.classList.remove("invisible") : this.classList.add("invisible");
					}
				}),
				"event": new EventPlugin(QBStart)
			});
						
			QBStart.checkNext = function (event, node){
				if (store.get("isCurrentStep") == false) store.set("displayNext", false);
				else {
					if (node.classList.contains("qbtitle")){
						(node.value.length>1 && store.get("description").length>1) ? store.set("displayNext", true) : store.set("displayNext", false);
					}
					else (node.value.length>1 && store.get("title").length>1) ? store.set("displayNext", true) : store.set("displayNext", false);
				};
			};
			
			QBStart.next = function (event, node){
					bObserver.notify("start-completed", store.get("title"), store.get("description"));
					store.set("isCurrentStep", false);
					store.set("displayNext", false);
			};
			
			bObserver.watch("session-started", function(sessionStore){
				store.reset({});
				store.set("title", sessionStore.get("title"));
				(sessionStore.get("description")) ? store.set("description", sessionStore.get("description")): store.set("description", "");
				// if current step is beyond start, then textareas are readonly
				(sessionStore.get("step") == "start") ? store.set("isCurrentStep", true) : store.set("isCurrentStep", false);
				
				(store.get("isCurrentStep") && store.get("title").length>1 && store.get("description").length>1) ? store.set("displayNext", true) : store.set("displayNext", false);
			});
			
			bObserver.watch("save-event", function(){
				if (store.get("isCurrentStep")) bObserver.notify("save-data", "start", null, {"title" : store.get("title"), "desc": store.get("description")});
			});
				
			QBStart.alive(Map.get("qbstart"));
			
			return QBStart;
			
		};
	});
