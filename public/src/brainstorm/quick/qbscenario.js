define("QBScenario", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "Param"],
	function(OObject, Map, ModelPlugin, EventPlugin, Store, Param){
		
		return function QBScenarioConstructor(bObserver){
			
			var QBScenario = new OObject();
			var timer = Param.get("quickB").timers[Param.get("quickB").steps.indexOf("scenario")];
			var qbScenarioTimer;
			var interval = 1000;
			var display = new Store({
				"isCurrentStep": false,
				"nextVisible": false,
				"timer": timer
			});
			var scenario = new Store({"title": "", "story": "", "solution": ""});
			
			QBScenario.plugins.addAll({
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
				"model": new ModelPlugin(scenario),
				"event": new EventPlugin(QBScenario)
			});
			
			var initTimer = function(){
				var updateTimer = function(){
					var time = display.get("timer");
					(time >=0) ? display.set("timer", time-interval ) : display.set("timer", 0);
					if (display.get("timer") == 0) clearInterval(qbScenarioTimer);
				}
				qbScenarioTimer = setInterval(updateTimer, interval);
			};
			
			QBScenario.checkNext = function(event, node){
				var name = node.getAttribute("name");
				if ((node.value.length > 1) && (display.get("isCurrentStep") == true)){
					switch(name){
						case "title":
							if ((scenario.get("story").length >1) && (scenario.get("solution").length>1)) display.set("nextVisible", true);
							break;
						case "story":
							if ((scenario.get("title").length >1) && (scenario.get("solution").length>1)) display.set("nextVisible", true);
							break;
						case "solution":
							if ((scenario.get("story").length >1) && (scenario.get("title").length>1)) display.set("nextVisible", true);
							break;
					}
				}
				else display.set("nextVisible", false);
			};
			
			QBScenario.next = function(event, node){
				var time = timer-display.get("timer")
				bObserver.notify("scenario-completed", time, scenario.get("title"), scenario.get("story"), scenario.get("solution"));
				display.set("isCurrentStep", false);
				display.set("nextVisible", false);
				display.set("timer", time);
				clearInterval(qbScenarioTimer);
			};
			
			bObserver.watch("qbcraft1-completed", function(){
				initTimer();
				display.set("isCurrentStep", true);
			});
			
			bObserver.watch("session-started", function(store){
				
				// initialize timer and scenario
				timer = Param.get("quickB").timers[Param.get("quickB").steps.indexOf("scenario")];
				scenario.reset({"title": "", "story": "", "solution": ""});
				
				// retrieve scenario info from past session if applicable
				if (store.get("scenario")) {
						scenario.set("title", store.get("scenario")[0].title);
						scenario.set("story", store.get("scenario")[0].story);
						scenario.set("solution", store.get("scenario")[0].solution);
					}
				
				// check if current step and manage display accordingly
				if (store.get("step") != "scenario") {
					display.set("isCurrentStep", false);
					display.set("nextVisible", false);
					var elapsed = store.get("elapsedTimers").scenario;
					(elapsed >0) ? display.set("timer", elapsed) : display.set("timer", timer);
				}
				else{
					display.set("isCurrentStep", true);
					display.set("timer", timer-store.get("elapsedTimers").scenario);
					if (display.get("timer")>0) initTimer();
					if ((scenario.get("title").length >1) && (scenario.get("story").length > 1) && (scenario.get("solution").length>1)) display.set("nextVisible", true);
				};
			});
			
			bObserver.watch("save-event", function(){
				if (display.get("isCurrentStep")) bObserver.notify("save-data", "scenario", timer - display.get("timer"), {"title" : scenario.get("title"), "story": scenario.get("story"), "solution": scenario.get("solution")});
			});
			
			bObserver.watch("exit-confirmed", function(){
				clearInterval(qbScenarioTimer);
			});
			
			QBScenario.alive(Map.get("qbscenario"));
			
			return QBScenario;
			
		};
		
	});
