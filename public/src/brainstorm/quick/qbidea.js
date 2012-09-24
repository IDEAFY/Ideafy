define("QBIdea", ["Map", "Olives/OObject", "Param", "Store", "Olives/Model-plugin", "Olives/Event-plugin"],
	function(Map, OObject, Param, Store, ModelPlugin, EventPlugin){
	
	return function QBIdeaConstructor(bObserver){
		
			var QBIdea = new OObject(),
			     timer = Param.get("quickB").timers[Param.get("quickB").steps.indexOf("idea")],
			     qbIdeaTimer,
			     interval = 1000,
			     display = new Store({
				"isCurrentStep": false,
				"nextVisible": false,
				"timer": timer
			     }),
			     idea = new Store({"title": "", "description": "", "solution": "", "visibility": "private"});
			
			QBIdea.plugins.addAll({
				"display": new ModelPlugin(display, {
					setVisible : function(visible){
						(visible)?this.classList.remove("invisible"):this.classList.add("invisible");
					},
					displayTimer : function(time){
						var minutes = Math.floor(time/60000);
						var seconds = Math.floor((time - minutes*60000)/1000)
						if (minutes<10) minutes = "0"+ minutes;
						if (seconds<10) seconds = "0"+seconds;
						this.innerHTML = minutes +":"+seconds;
						if ((time<120000) && (display.get("isCurrentStep"))){
							(time == 0)? this.setAttribute("style", "color: red") : this.setAttribute("style", "color:#FFA900");
						}
						else this.setAttribute("style", "color: white");
					},
					setReadOnly : function(editable){
						(!editable) ? this.setAttribute("readonly", "readonly") : this.removeAttribute("readonly");
					}
				}),
				"model": new ModelPlugin(idea, {
					togglePublic: function(visibility){
						if (this.getAttribute("value") == visibility) this.setAttribute("checked", "checked");
					}
				}),
				"event": new EventPlugin(QBIdea)
			});
			
			var initTimer = function(){
				var updateTimer = function(){
					var time = display.get("timer");
					(time >=0) ? display.set("timer", time-interval ) : display.set("timer", 0);
					if (display.get("timer") == 0) clearInterval(qbIdeaTimer);
				};
				qbIdeaTimer = setInterval(updateTimer, interval);
			};
			
			QBIdea.changeVisibility = function(event, node){
				(display.get("isCurrentStep")) ? idea.set("visibility", node.getAttribute("value")): event.preventDefault();
			};
			
			QBIdea.checkNext = function(event, node){
				var name = node.getAttribute("name");
				if ((node.value.length > 1) && (display.get("isCurrentStep") == true)){
					switch(name){
						case "title":
							if ((idea.get("description").length >1) && (idea.get("solution").length>1)) display.set("nextVisible", true);
							break;
						case "description":
							if ((idea.get("title").length >1) && (idea.get("solution").length>1)) display.set("nextVisible", true);
							break;
						case "solution":
							if ((idea.get("description").length >1) && (idea.get("title").length>1)) display.set("nextVisible", true);
							break;
					}
				}
				else display.set("nextVisible", false);
			};
			
			QBIdea.next = function(event, node){
				var time = timer-display.get("timer");
				bObserver.notify("idea-completed", time, idea.toJSON());
				display.set("isCurrentStep", false);
				display.set("nextVisible", false);
				display.set("timer", time);
				clearInterval(qbIdeaTimer);
			};
			
			bObserver.watch("qbcraft2-completed", function(){
				initTimer();
				display.set("isCurrentStep", true);
			});
			
			bObserver.watch("session-started", function(store){
				
				// initialize timer and idea
				timer = Param.get("quickB").timers[Param.get("quickB").steps.indexOf("idea")];
				idea.reset({"title": "", "description": "", "solution": "", "visibility": "private"});
				
				// retrieve idea info from past session if applicable
				if (store.get("idea")) {
						idea.set("title", store.get("idea")[0].title);
						idea.set("description", store.get("idea")[0].description);
						idea.set("solution", store.get("idea")[0].solution);
						idea.set("visibility", store.get("idea")[0].visibility);
					}
				
				// check if current step and manage display accordingly
				if (store.get("step") != "idea") {
					display.set("isCurrentStep", false);
					display.set("nextVisible", false);
					var elapsed = store.get("elapsedTimers").idea;
					(elapsed >0) ? display.set("timer", elapsed) : display.set("timer", timer);
				}
				else{
					display.set("isCurrentStep", true);
					display.set("timer", timer-store.get("elapsedTimers").idea);
					if (display.get("timer")>0) initTimer();
					if ((idea.get("title").length >1) && (idea.get("description").length > 1) && (idea.get("solution").length>1)) display.set("nextVisible", true);
				};
			});
			
			bObserver.watch("save-event", function(){
				if (display.get("isCurrentStep")) bObserver.notify("save-data", "idea", timer - display.get("timer"), {"title" : idea.get("title"), "description": idea.get("description"), "solution": idea.get("solution"), "visibility": idea.get("visibility")});
			});
			
			bObserver.watch("exit-confirmed", function(){
				clearInterval(qbIdeaTimer);
			});
		
		QBIdea.alive(Map.get("qbidea"));
		
		return QBIdea;
		
	}
	
});
