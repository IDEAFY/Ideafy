define("QBTech", ["Olives/OObject", "Map", "Store", "Param", "CouchDBStore", "Olives/Transport", "Config", "Olives/Model-plugin", "Olives/Event-plugin"],
	function(OObject, Map, Store, Param, CouchDBStore, Transport, Config, ModelPlugin, EventPlugin){
		
		return function QBTechConstructor(bObserver){
			
			var QBTech = new OObject();
			var timer = Param.get("quickB").timers[Param.get("quickB").steps.indexOf("tech")];
			var qbTechTimer;
			var interval = 1000;
			var display = new Store({
				"isCurrentStep": false,
				"nextVisible": false,
				"timer": timer,
				"cardsInDeck": 0,
				"drawok": [],
				"scenarioTitle": "",
				"showTechnoDeck": true
			});
			var scenario = {"title": "", "story": "", "solution": "", "authors": "", "date": ""};
			var nbTech = Param.get("quickB").nbTech;
			var techList = [];
			var techDeck = [];
			var techStack = [];
			var techCards = new Store([]);

			QBTech.plugins.addAll({
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
						if (time>30000) this.setAttribute("style", "color: white");
						else if (display.get("isCurrentStep")){
							(time == 0)? this.setAttribute("style", "color: red") : this.setAttribute("style", "color:#FFA900");
						};
					},
					setBg : function(array){
						var idx =  this.getAttribute("data-model_id");
						(array[idx]) ? this.setAttribute("style", "background-image: url('/images/brainstorm/locked.png')") : this.setAttribute("style", "background-image: url('/images/brainstorm/unlocked.png')");
					},
					toggleRemove : function(array){
						var idx =  this.getAttribute("data-model_id");
						(array[idx]) ? this.classList.add("invisible") : this.classList.remove("invisible");
						// always hide remove button if there is only one card remaining
						if (techList.length <= 1) this.classList.add("invisible");
					}
				}),
				"model": new ModelPlugin(techCards),
				"event": new EventPlugin(QBTech)
			});

			// Functions
			
			/*
			 * automatic draw is called when time expires and drawing is not finished
			 */
			var automaticDraw = function(){
				
				clearInterval(qbTechTimer);
				
				alert("time expired: technologies will be assigned automatically");
				
				var selectedTech =[];
				// reset tech Stack, keeping the techs already selected by the user
				for(i=0; i<display.get("drawok").length; i++){
					if (display.get("drawok")[i] == 1) selectedTech.push(techList[i]); 
				};
				resetTechStack(selectedTech);
				
				// draw missing cards to complete the set
				drawCards(numberToDraw());
				// position lock
				var arr = [];
				for (i=0; i<nbTech; i++) arr.push(1);
				display.set("drawok", arr);
				
				// display cards
				displayTechCards(techList);
				
				// show next button
				display.set("nextVisible", true); 
				
				// hide technoDeck
				display.set("showTechnoDeck", false);
			};
			
			/*
			 * displayTechCards fetches tech data from couchDB to display in the drawing area
			 */
			var displayTechCards = function(array){
				techCards.reset([]);
				var techCDB = new CouchDBStore([]);
				techCDB.setTransport(Config.get("Transport"));
				techCDB.sync("taiaut", {keys: array}).then(function(){
					techCDB.loop(function(value, idx){
							techCards.alter("push", value);
					});
				});
			};
			
			/*
			 * DrawCards draws a number of random cards from the deck
			 */
			var drawCards = function(number){
				
				var drawCard = function(array){
					l = array.length;
					var idx = Math.floor(Math.random()*l);
					var res = array[idx];
					array.splice(idx, 1);
					return res;
				};
				// declare a variable to keep track of insertion positions
				var pos = display.get("drawok").concat();
				
				// check if there are enough cards left in stack
				if (number < display.get("cardsInDeck")){
					for (i=0; i<number; i++){
						var j=0;
						var inserted = false;
						while (!inserted){
							if (pos[j]) j++;
							else{
								techList[j] = drawCard(techStack);
								pos[j] = 1;
								inserted = true;
							};
						};
					};
				}
				else {
					// start by assigning the remaining cards
					var remaining = techStack.concat();
					
					// reset techStack, remove both locked techno & remaining cards
					var remove = remaining.concat();
					for (i=0; i<techList.length; i++){
						if (display.get("drawok")[i]) remove.push(techList[i]);
					};
					resetTechStack(remove);
					
					// draw the rest of the cards needed from the reshuffled stack
					var nb = number - remaining.length;
					for (i=0; i<nb; i++){
						remaining.push(drawCard(techStack));
					};
					
					// and finally build techList adding the cards in remaining
					for (i=0; i<remaining.length; i++){
						var inserted = false;
						var j = 0;
						while (!inserted){
							if(pos[j]) j++;
							else{
								techList[j] = remaining[i];
								inserted = true;
								pos[j] = 1;
							};
						};
					};
				};
				display.set("cardsInDeck", techStack.length);
			};			
			
			var initStatus = function(){
				var arr = new Array();
				for (i=0; i<nbTech; i++){
					arr[i]=0};
				display.set("drawok", arr.concat());
			};

			var initTimer = function(){
				var updateTimer = function(){
					var time = display.get("timer");
					(time >=0) ? display.set("timer", time-interval ) : display.set("timer", 0);
					if (display.get("timer") == 0) {
						//perform automatic draw if needed (ie not all cards are locked)
						if (display.get("nextVisible") == false) automaticDraw();
					}
				}
				qbTechTimer = setInterval(updateTimer, interval);
			};
			
			var numberToDraw = function(){
				var arr = display.get("drawok").concat();
				var n = arr.reduce(function(x,y){return(x+y);});
				return (nbTech - n);
			};
			
			var resetTechStack = function(array){
				
				// reset techStack to initial deck contents
				techStack = techDeck.concat();
				// if there are cards to exclude (e.g. already present and locked, do so now)
				if (array && array.length>0){
					for (i=0; i<array.length; i++){
						techStack.splice(techStack.indexOf(array[i]), 1);	
					};
				};
				// update display with number of cards left in stack
				display.set("cardsInDeck", techStack.length);
			};
			
			QBTech.draw = function(event, node){
				
				// initialize timer and draw all cards if this is the first click
				if (display.get("timer") == timer) {
					initTimer();
					drawCards(nbTech);
				}
				else if (display.get("timer")>0) {
					// or draw a number of cards depending on how many are already present (and remove discarded ones)
					var nb = numberToDraw();
					drawCards(nb);
				};
				displayTechCards(techList);
				
			};
			
			QBTech.toggleLock = function(event, node){
				// do nothing if timer is expired
				if (display.get("timer") > 0){
					var idx = node.getAttribute("data-model_id");
					var array = display.get("drawok");
					(array[idx] == 0) ? array[idx]=1 : array[idx]=0;
					display.set("drawok", array);
					// check if next button should be displayed (ie. all techs locked)
					(array.reduce(function(x,y){return(x+y);}) == nbTech) ? display.set("nextVisible", true) : display.set("nextVisible", false);
					// check if tech stack should be hidden or not
					(display.get("nextVisible") == false)? display.set("showTechnoDeck", true) : display.set("showTechnoDeck", false);
				}
			};
			
			QBTech.remove = function(event, node){
				alert("this will permanently reduce the number of tech cards available for your solution");
				var idx = node.getAttribute("data-model_id");
				// remove item from techlist
				display.get("drawok").splice(idx, 1);
				techList.splice(idx, 1);
				nbTech--;
				// refresh display
				displayTechCards(techList);
				// check if all remaining cards are in locked state and if yes display next button
				if (display.get("drawok").reduce(function(x,y){return(x+y);}) == display.get("drawok").length) display.set("nextVisible", true);
			};
			
			QBTech.zoom = function(event, node){
				Config.get("observer").notify("display-popup","brainstorm", "techno", techList[node.getAttribute("data-model_id")]);
			};
			
			QBTech.displayScenario = function(event, node){
				Config.get("observer").notify("display-popup", "brainstorm", "scenario", scenario);
			};
			
			QBTech.next = function(event, node){
				var time = timer-display.get("timer");
				clearInterval(qbTechTimer);
				display.set("isCurrentStep", false);
				display.set("nextVisible", false);
				display.set("showTechnoDeck", false);
				display.set("timer", time);
				bObserver.notify("tech-completed", time, techList);
			};
			
			bObserver.watch("scenario-completed", function(time, title, story, solution){
				
				// get scenario info
				scenario.title = title;
				scenario.story = story;
				scenario.solution = solution;
				
				// prepare display
				display.set("scenarioTitle", scenario.title);
				display.set("isCurrentStep", true);
				
				// initialize tech status
				nbTech = Param.get("quickB").nbTech;
				initStatus();
				
				// show techno deck
				display.set("showTechnoDeck", true);
			});
			
			bObserver.watch("session-started", function(store){
				
				// reset display
				display.reset({
					"isCurrentStep": false,
					"nextVisible": false,
					"timer": timer,
					"cardsInDeck": 0,
					"drawok": [],
					"scenarioTitle": "",
					"showTechnoDeck": true
				});
				
				// reset techList and reinitialize timer to be safe
				techList = [];
				techStack = [];
				techCards.reset([]);
				
				// initialize tech status
				nbTech = Param.get("quickB").nbTech;
				initStatus();
				
				// initialize timer
				timer = Param.get("quickB").timers[Param.get("quickB").steps.indexOf("tech")];
				
				// retrieve deck information
				var deck = new CouchDBStore({});
				deck.setTransport(Config.get("Transport"));
				deck.sync("taiaut", store.get("deck")).then(function(){
					techDeck = deck.get("content").techno.concat();
					
					// check if there are saved cards then display them
					if ((store.get("techno") && store.get("techno")[0]) && (store.get("techno")[0].length >0)){
						techList = store.get("techno")[0].concat();
						// display existing cards
						displayTechCards(techList);
						// position lock status
						var techStatus = [];
						for (i=0; i<nbTech; i++) { (techList[i]) ? techStatus[i] = 1 : techStatus[i] = 0 };
						display.set("drawok", techStatus);
						// if the required number of cards is already present then show next button
						if (techList.length == nbTech) {
							display.set("showTechnoDeck", false);
							if (display.get("isCurrentStep")) display.set("nextVisible", true);
						};
					}
					else {
						initStatus();
					};
					// remove saved cards from stack so they cannot be drawn again
					resetTechStack(techList);
					// display number of cards left in techStack
					display.set("cardsInDeck", techStack.length);
					
				});
				
				// check if scenario exists and display card
				if (store.get("scenario")){
					scenario.title = store.get("scenario")[0].title;
					display.set("scenarioTitle", scenario.title);
					scenario.story = store.get("scenario")[0].story;
					scenario.solution = store.get("scenario")[0].solution;
				};
				
				// initialize scenario data (author & date)
				var fn = Config.get("user").get("firstname");
				var ln = Config.get("user").get("lastname");
				scenario.authors = fn+" "+ln;
				scenario.date = store.get("date").concat();
				
				var elapsed = store.get("elapsedTimers").tech;
				// check if this is the current step
				if (store.get("step") == "tech"){
					display.set("isCurrentStep", true);
					(elapsed >0) ? display.set("timer", timer-elapsed) : display.set("timer", timer);
					
					// launch timer if it is less than default value and not expired
					if ((display.get("timer")<timer) && (display.get("timer")>0)) initTimer();
					
					// show techno deck
					display.set("showTechnoDeck", true);	
				}
				else{
					// if it is not current step and there is some elapsed time, display elapsd time (it means step is complete)
					if (elapsed) display.set("timer", elapsed);
					display.set("showTechnoDeck", false);
				}
			});
			
			bObserver.watch("save-event", function(){
				if (display.get("isCurrentStep")){
					var saveData=[];
					for (i=0; i<techList.length; i++){
						if (display.get("drawok")[i]) saveData.push(techList[i]);
					};
					bObserver.notify("save-data", "qbtech", timer - display.get("timer"), saveData);
				};
			});
			
			bObserver.watch("exit-confirmed", function(){
				clearInterval(qbTechTimer);
			});
						
			QBTech.alive(Map.get("qbtech"));
			
			return QBTech;	
		}		
	});
