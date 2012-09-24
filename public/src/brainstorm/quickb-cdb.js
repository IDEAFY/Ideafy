define("QuickB", ["Olives/OObject", "Stack", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Param", "Utils", "Config", "CouchDBStore", "QBStart", "QBSetup", "QBCraft1"],
	function(OObject, Stack, Map, Store, ModelPlugin, EventPlugin, Param, Utils, Config, CouchDBStore, QBStart, QBSetup, QBCraft1){
		
		return function QuickBConstructor(bObserver){
			
			var QB = new OObject();
			/*
			 * the header contains a status bar showing all steps of the session, progress and allowing navigation
			 * between the allowed steps, ie. "done" or "in progress"
			 */
			var QBHeader = new OObject();
			
			/*
			 * A quick brainstorming session is defined by the following steps:
			 */
			var QBSteps = new Store([
				{"name": "setup", "title": "Setting up a situation", "status":"", "timer": Param.get("setupTime")},
				{"name": "craft1", "title": "Crafting a story", "status": "", "timer": null},
				{"name": "scenario", "title": "SCENARIO", "status": "", "timer": null},
				{"name": "tech", "title": "Drawing technologies", "status": "", "timer": null},
				{"name": "craft2", "title": "Crafting a solution", "status": "", "timer": null},
				{"name": "idea", "title": "IDEA", "status": "", "timer": null}
			]);
			var QBStack;
			var sessionCDB = new CouchDBStore({});
			sessionCDB.setTransport(Config.get("Transport"));
			var currentStep;
			var sessionId;
			
			//define plugins for header status bar UI			
			QBHeader.plugins.addAll({
				"model": new ModelPlugin(QBSteps, {
					setStatus : function(status){
						if (status == "in progress") this.setAttribute("style", "background: yellow; color: black;");
						if (status == "done") this.setAttribute("style", "background: palegreen; color: black");
					}
				}),
				"event": new EventPlugin(QBHeader)
			});

			// a method to update the model of QBHeader with the current status of the session (ie which steps are done etc.)
			QBSteps.updateStatus = function(step){
				var current = false;
				if (step != "start") QBSteps.loop(function(value, idx){
					if (!current){
						if (value.name != step) QBSteps.update(idx, "status", "done");
						if (value.name == step) {
							QBSteps.update(idx, "status", "in progress");
							current = true;
						};
					};
				});
			};
			
			// a method to move to the next step (changes currentStep to the one immediately following, updates status and changes view)
			QBSteps.nextStep = function(step){
				(step == "start") ? currentStep = "setup" : QBSteps.loop(function(value, idx){if (value.name == step) currentStep = QBSteps.get(idx+1).name});
				QBSteps.updateStatus(currentStep);
				//update couchDBStore session
				sessionCDB.set("step", currentStep);
				sessionCDB.upload().then(function(){
					QBStack.show(currentStep);
				});

			};
			
			// a method to reset status (called when a user enters a new session)
			QBSteps.resetStatus = function(){
				QBSteps.loop(function(value, idx){
					QBSteps.update(idx, "status", "");
				});
			};
			
			// a function to initialize a screen stack for the quick brainstorming session
			var initQBStack = function(){
				// a stack to display a different screen for each of the steps of a brainstorming
				QBStack = new Stack(Map.get("qbcontentstack"));
				QBStack.addAll({"start": QBStart(bObserver), "setup": QBSetup(bObserver), "craft1": QBCraft1(bObserver)});
				QBStack.show(currentStep);
			};
			
			// a function to initialize a session and display the stack
			var initQBSession = function(){
				QBSteps.resetStatus();
				// get current step and update header
				currentStep = sessionCDB.get("step");
				QBSteps.updateStatus(currentStep);
				// initialize the stack
				initQBStack();
				// notify session started
				bObserver.notify("session-started", sessionCDB);
			}
			
			// a function to update a user document with a session in Progress
			var userUpdateSessionInProgress = function(id){
				// modify user document in couchDB with new session in progress
				var userCDB = new CouchDBStore();
				userCDB.setTransport(Config.get("Transport"));
				userCDB.sync("taiaut", Config.get("user").get("_id")).then(function(){
					userCDB.set("sessionInProgress", {"id": id, "type": "quick"});
					userCDB.upload();
				});
					
				// update local userinfo
				Config.get("user").set("sessionInProgress", {"id": id, "type": "quick"});
			}
			
			// a function to start a new brainstorming session -- creates a session document in the databse
			var startQuickBSession = function(){
				var now = new Date();
				var name = Config.get("user").get("firstname");
				var id = "S:" + now.getTime();
				var defaultTitle = name+"'s session, "+ now.toDateString();
				sessionCDB.unsync();
				sessionCDB.reset({
					"title": defaultTitle,
					"description": null,
					"initiator": Config.get("user").get("_id"),
					"participants": [],
					"date": [now.getFullYear(), now.getMonth(), now.getDate()],
					"startTime": now.getTime(),
					"duration": 0,
					"mode": "quick",
					"type": 8,
					"deck": Param.get("currentDeck"),
					"status": "ongoing",
					"step": "start"
				});
				sessionCDB.sync("taiaut", id);
				sessionCDB.upload().then(function(){
					initQBSession();
					userUpdateSessionInProgress(id);
				});
				sessionId = id;
			};
			
			// a function to resume an existing brainstorming session
			var continueQuickBSession = function(id){
				// synchronize session document with existing one in couchDB
				sessionCDB.unsync();
				sessionCDB.reset({});
				sessionCDB.sync("taiaut", id).then(function(){
					userUpdateSessionInProgress(id);
					initQBSession();
				});
				sessionId = id;
			};
			
			bObserver.watch("start-session", function(type){
				if (type == "quick") startQuickBSession();
			});
			
			bObserver.watch("continue-session", function(sessionObject){
				if (sessionObject.type == "quick") continueQuickBSession(sessionObject.id);
			});
			
			bObserver.watch("start-completed", function(title, description){
				sessionCDB.set("title", title);
				sessionCDB.set("description", description);
				QBSteps.nextStep("start");
			});
			
			bObserver.watch("setup-completed", function(arrayChar, arrayContext, arrayProblem){
				sessionCDB.set("characters", arrayChar);
				sessionCDB.set("contexts", arrayContext);
				sessionCDB.set("problelms", arrayProblem);
				QBSteps.nextStep("setup");
			});
			
			bObserver.watch("next-step", function(){
				QBSteps.nextStep(currentStep);
			});
			
			bObserver.watch("exit-event", function(){
				alert("your session in progress will be saved");
				var now = new Date();
				sessionCDB.set("duration", now-sessionCDB.get("startTime"));
				sessionCDB.upload().then(function(){
					bObserver.notify("exit-confirmed");
				});
			});
			
			QBHeader.show = function(event, node){
				if (node.classList.contains("qbstartingpoint")) QBStack.show("start")
				else if (node.classList.contains("qbstep")){
					var idx = node.getAttribute("data-model_id");
					if ((QBSteps.get(idx).status == "done") || (QBSteps.get(idx).status == "in progress")) QBStack.show(QBSteps.get(idx).name);
				}
				else if (node.classList.contains("qbwrapup")){
					if (QBSteps.get(QBSteps.getNbItems()-1).status == "done") QBStack.show("wrapup");
				}
			};
			
			QBHeader.alive(Map.get("qbheader"));
			QB.alive(Map.get("quickbrainstormingstack"));
						
			return QB;			
		}
	});
