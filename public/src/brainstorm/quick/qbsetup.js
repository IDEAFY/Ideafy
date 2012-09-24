define("QBSetup", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "Olives/Transport", "Store", "Config", "Param"],
	function(OObject, Map, ModelPlugin, EventPlugin, CouchDBStore, Transport, Store, Config, Param){
		
		return function QBSetupConstructor(bObserver){
			
			var QBSetup = new OObject();
			var display = new Store({});
			var characters = [],
				contexts = [],
				problems = [];
			var deckid;
			var character = new CouchDBStore({}),
				context = new CouchDBStore({}),
				problem = new CouchDBStore({});
			var charDrawn, contextDrawn, problemDrawn;
			var next = document.querySelector(".setupcomplete");
			var timer = Param.get("quickB").timers[(Param.get("quickB").steps.indexOf("setup"))];
			var setupTimer = null;
			var interval = 1000;
			
			//assign transports
			character.setTransport(Config.get("Transport"));
			context.setTransport(Config.get("Transport"));
			problem.setTransport(Config.get("Transport"));
			
			QBSetup.plugins.addAll({
				"display": new ModelPlugin(display, {
					setVisible : function(visible){
						(visible)? this.classList.remove("invisible") : this.classList.add("invisible");
					},
					setBg : function(cardOK){
						(cardOK)? this.setAttribute("style", "background-image: url('/images/brainstorm/locked.png')") : this.setAttribute("style", "background-image: url('/images/brainstorm/unlocked.png')");
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
					}
				}),
				"char": new ModelPlugin(character),
				"context": new ModelPlugin(context),
				"problem": new ModelPlugin(problem),
				"event": new EventPlugin(QBSetup)
			});
						
			var drawCard = function(type){
				
				switch(type){
					
					case "char":
						charDrawn++;
						display.set("char", true);
						var nb = display.get("nbChar");
						var idx = Math.floor(Math.random()*nb);
						if (nb >= 1){
							display.set("nbChar", nb-1);
							character.unsync();
							character.reset({});
							character.sync("taiaut", characters[idx]).then(function(){
								characters.splice(idx, 1);
							});
						};
						if (display.get("nbChar") == 0) display.set("reloadchars", true);;
						break;
						
					case "context":
						contextDrawn++;
						display.set("context", true);
						var nb = display.get("nbContext");
						var idx = Math.floor(Math.random()*nb);
						if (nb >= 1){
							display.set("nbContext", nb-1);
							context.unsync();
							context.reset({});
							context.sync("taiaut", contexts[idx]).then(function(){
								contexts.splice(idx, 1);
							});
						};
						if (display.get("nbContext") == 0) display.set("reloadcontexts", true);;
						break;
						
					case "problem":
						problemDrawn++;
						display.set("problem", true);
						var nb = display.get("nbProblem");
						var idx = Math.floor(Math.random()*nb);
						if (nb >= 1){
							display.set("nbProblem", nb-1);
							problem.unsync();
							problem.reset({});
							problem.sync("taiaut", problems[idx]).then(function(){
								problems.splice(idx, 1);
							});
						};
						if (display.get("nbProblem") == 0) display.set("reloadproblems", true);;
						break;	
				}	
			};
			
			var	initDeckContent = function(id){
				var deck = new CouchDBStore({});
				deck.setTransport(Config.get("Transport"));
				deck.sync("taiaut", id).then(function(){
						characters = deck.get("content").characters.concat();
						contexts = deck.get("content").contexts.concat();
						problems = deck.get("content").problems.concat();
						initDraw();
					});
			};
			
			var initDraw = function(){
				character.reset({});
				context.reset({});
				problem.reset({});
				resetDisplay();
				charDrawn = contextDrawn = problemDrawn = 0;
			};
			
			var resetDisplay = function(){
				display.reset({
					"char": false,
					"context": false,
					"problem": false,
					"nbChar": characters.length,
					"nbContext": contexts.length,
					"nbProblem": problems.length,
					"charok": false,
					"contextok": false,
					"problemok": false,
					"reloadchars": false,
					"reloadcontexts": false,
					"reloadproblems": false,
					"showchardeck": true,
					"showcontextdeck": true,
					"showproblemdeck": true,
					"isCurrentStep": true,
					"timer": timer,
					"unlocked": true,
					"nextVisible": false
				});
			};

			
			var setAutomaticDraw = function(){
				
				// disable lock/unlock button
				display.set("unlocked", false);
				
				// hide decks
				display.set("showchardeck", false);
				display.set("showcontextdeck", false);
				display.set("showproblemdeck", false);
				
				// for each type check if a card has been selected - if not pick one randomly
				if (!display.get("charok")) {
					display.set("nbChar", characters.length);
					drawCard("char");
					
				};
				if (!display.get("contextok")) {
					display.set("nbContext", contexts.length);
					drawCard("context");
				};
				if (!display.get("problemok")) {
					display.set("nbProblem", problems.length);
					drawCard("problem");
				};
				
				
				// show next button
				display.set("nextVisible", true);
				
			};
			
			var updateTimer = function(){
				var time = display.get("timer");
				(time >=0) ? display.set("timer", time-interval ) : display.set("timer", 0);
					
				// if time runs out draw will be done automatically
				if (display.get("timer") == 0) {
						clearInterval(setupTimer);
						setAutomaticDraw();
 				};
			};
			
			QBSetup.reload = function(event, node){
				event.stopPropagation();
				var deck = new CouchDBStore({});
				deck.setTransport(Config.get("Transport"));
				deck.sync("taiaut", deckid).then(function(){
					if (node.classList.contains("reloadchars")) {
						characters = deck.get("content").characters.concat();
						display.set("nbChar", characters.length);
						display.set("char", false);
						display.set("reloadchars", false);
					};
					if (node.classList.contains("reloadcontexts")) {
						contexts = deck.get("content").contexts.concat();
						display.set("nbContext", contexts.length);
						display.set("context", false);
						display.set("reloadcontexts", false);
					};
					if (node.classList.contains("reloadproblems")) {
						problems = deck.get("content").problems.concat();
						display.set("nbProblem", problems.length);
						display.set("problem", false);
						display.set("reloadproblems", false);
					};
				});
			};
			
			QBSetup.draw = function(event, node){
				// check if its the first draw and if yes init countdown
				if (!charDrawn && !contextDrawn && !problemDrawn) setupTimer = setInterval(updateTimer, interval);
				
				// check if this particular card type is locked --> means choice (already made)
				var check = node.getAttribute("name")+"ok";
				if (!display.get(check)) drawCard(node.getAttribute("name"));
			};
			
			QBSetup.toggleLock = function (event, node){
				switch(node.getAttribute("name")){
					case "charok":
						if (display.get("char")){
							display.set("charok", !display.get("charok"));
							(display.get("charok")) ? display.set("showchardeck", false) : display.set("showchardeck", true);
						}
						break;
					case "contextok":
						if (display.get("context")){
							display.set("contextok", !display.get("contextok"));
							(display.get("contextok")) ? display.set("showcontextdeck", false) : display.set("showcontextdeck", true);
						}
						break;
					case "problemok":
						if (display.get("problem")){
							display.set("problemok", !display.get("problemok"));
							(display.get("problemok")) ? display.set("showproblemdeck", false) : display.set("showproblemdeck", true);
						}
						break;
				};
				(display.get("charok") && display.get("contextok") && display.get("problemok") && display.get("isCurrentStep")) ? display.set("nextVisible", true) : display.set("nextVisible", false);
			};
			
			QBSetup.zoom = function(event, node){
				if (node.classList.contains("smallcharactercard")) Config.get("observer").notify("display-popup","brainstorm", "char", character.get("_id"));
				if (node.classList.contains("smallcontextcard")) Config.get("observer").notify("display-popup", "brainstorm", "context", context.get("_id"));
				if (node.classList.contains("smallproblemcard")) Config.get("observer").notify("display-popup", "brainstorm", "problem", problem.get("_id"));
			};
			
			QBSetup.next = function (event, node){
				// stop countdown
				clearInterval(setupTimer);
				// send data (cards and duration) to the session
				var time = timer - display.get("timer");
				bObserver.notify("setup-completed", time, [character.get("_id")], [context.get("_id")], [problem.get("_id")]);
				// lock choices
				display.set("unlocked", false);
				// setup is no longer the current step
				display.set("isCurrentStep", false);
				// hide next button
				display.set("nextVisible", false);
				//show elapsed time instead of remaining time
				display.set("timer", time);
			};
			
			
			// initialize
			
			// session started event
			bObserver.watch("session-started", function(store){
				
				resetDisplay();
				timer = Param.get("quickB").timers[(Param.get("quickB").steps.indexOf("setup"))];
				
				/*
				 * if setup is not the current step and cards are present we are in "readonly" mode
				 * display card, hide next button and show duration of the step
				 */ 
				if (store.get("characters") && (store.get("characters").length > 0)){
					display.set("char", true);
					display.set("context", true);
					display.set("problem", true);
					display.set("unlocked", false);
					display.set("showchardeck", false);
					display.set("showcontextdeck", false);
					display.set("showproblemdeck", false);
					character.unsync();
					context.unsync();
					problem.unsync();
					character.reset({});
					context.reset({});
					problem.reset({});
					character.sync("taiaut", store.get("characters")[0]);
					context.sync("taiaut", store.get("contexts")[0]);
					problem.sync("taiaut", store.get("problems")[0]);
					display.set("timer", store.get("elapsedTimers").setup);
				}
				else {
					deckid = store.get("deck");
					initDeckContent(deckid);
				}
			});
			
			bObserver.watch("exit-confirmed", function(){
				clearInterval(setupTimer);
				resetDisplay();
			});
			
			QBSetup.alive(Map.get("qbsetup"));
			
			return QBSetup;
			
		};
		
	});
