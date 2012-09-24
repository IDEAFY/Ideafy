define("QuickB", ["Olives/OObject", "Stack", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Param", "Utils", "Config", "CouchDBStore", "Olives/LocalStore", "SyncUtils", "QBStart", "QBSetup", "QBCraft1", "QBScenario", "QBTech", "QBCraft2", "QBIdea", "QBWrapup"],
	function(OObject, Stack, Map, Store, ModelPlugin, EventPlugin, Param, Utils, Config, CouchDBStore, LocalStore, SyncUtils, QBStart, QBSetup, QBCraft1, QBScenario, QBTech, QBCraft2, QBIdea, QBWrapup){
		
		return function QuickBConstructor(bObserver){
			
			var QB = new OObject();
			/*
			 * the header contains a status bar showing all steps of the session, progress and allowing navigation
			 * between the allowed steps, ie. "done" or "in progress"
			 */
			var QBHeader = new OObject();
			var QBSteps = new Store([]);
			
			// create the screen stack with the various UIs of a quickb session
			var QBStack = new Stack(Map.get("qbcontentstack"));
			QBStack.addAll({"start": QBStart(bObserver), "setup": QBSetup(bObserver), "craft1": QBCraft1(bObserver), "scenario": QBScenario(bObserver), "tech": QBTech(bObserver), "craft2": QBCraft2(bObserver), "idea": QBIdea(bObserver), "wrapup": QBWrapup(bObserver)});
			
			var session = new LocalStore({});
			var currentStep;
			var sessionId;
			
			// boolean & timer for data saving: postits are saved into the session after "savingInterval" ms.
			var savingTimer;
			var savingInterval = 30000;
			
			//define plugins for header status bar UI			
			QBHeader.plugins.addAll({
				"model": new ModelPlugin(QBSteps, {
					setStatus : function(status){
						if (status == "in progress") this.setAttribute("style", "background: yellow; color: black;");
						else if (status == "done") this.setAttribute("style", "background: palegreen; color: black");
						else this.setAttribute("style", "background: white; color: gray;");
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
						else {
							QBSteps.update(idx, "status", "in progress");
							current = true;
						};
					};
				});
			};
			
			// a method to move to the next step (changes currentStep to the one immediately following, updates status and changes view)
			QBSteps.nextStep = function(step){
				if (step == "start") currentStep = QBSteps.get(0).name;
				else{
					QBSteps.loop(function(value, idx){
						if (value.name == step) currentStep = QBSteps.get(idx+1).name;
					});
				};
				console.log("current", currentStep);
				QBSteps.updateStatus(currentStep);
				//update session & localstorage
				session.set("step", currentStep);
				session.sync(sessionId);
				QBStack.show(currentStep);
			};
			
			// a method to reset status (called when a user enters a new session)
			QBSteps.resetStatus = function(){
				QBSteps.loop(function(value, idx){
					QBSteps.update(idx, "status", "");
				});
			};
			
			
			/*
			 * a function to initialize a session and display the stack
			 */
			var initQBSession = function(){
				
				QBSteps.reset([]);
			 	//Retrieve QuickB configuration, ie various stages from Param settings:
				var qb = Param.get("quickB");
				for (i=0, l=qb.steps.length; i<l; i++){
					QBSteps.alter("push", {"name": qb.steps[i], "title": qb.labels[i], "timer": qb.timers[i]});
					QBSteps.update(i, "status", "");
				};
				// and add final step (wrapup)
				QBSteps.alter("push", {"name": "wrapup", "title": "Recap", "status": ""});
				
				// get current step and update header
				currentStep = session.get("step");
				console.log(currentStep);
				QBSteps.updateStatus(currentStep);
				
				// initialize the screens by passing the session info
				bObserver.notify("session-started", session);
				
				// initialize autosave
				savingTimer = setInterval(function(){bObserver.notify("save-event")}, savingInterval);
				
				// display current step
				QBStack.show(currentStep);
			};
			
			// a function to update a user document with a session in Progress or to reinitialize session in progress if no param is passed
			var userUpdateSessionInProgress = function(id){
				// modify user document in couchDB with new session in progress
				// to be replaced with user local store
				var sip;
				(id) ? sip = {"id": id, "type": "quick"} : sip = {};
				var userCDB = new CouchDBStore();
				userCDB.setTransport(Config.get("Transport"));
				userCDB.sync("taiaut", Config.get("user").get("_id")).then(function(){
					userCDB.set("sessionInProgress", sip);
					userCDB.upload();
				});
					
				// update local userinfo
				Config.get("user").set("sessionInProgress", sip);
			};
			
			// a function to start a new brainstorming session -- creates a session document in the databse
			var startQuickBSession = function(){
				var now = new Date();
				var name = Config.get("user").get("firstname");
				var id = "S:" + now.getTime();
				var defaultTitle = name+"'s session, "+ now.toDateString();
				session.reset({
					"_id": id,
					"title": defaultTitle,
					"description": null,
					"initiator": {"id":Config.get("user").get("_id"), "username": Config.get("user").get("username")},
					"participants": [],
					"authornames": Config.get("user").get("username"),
					"date": [now.getFullYear(), now.getMonth(), now.getDate()],
					"startTime": now.getTime(),
					"resumeTime": now.getTime(),
					"duration": 0,
					"elapsedTime": 0,
					"elapsedTimers": {},
					"mode": "quick",
					"type": 8,
					"deck": Param.get("currentDeck"),
					"status": "in progress",
					"step": "start",
					"characters": [],
					"contexts": [],
					"problems": [],
					"creativity1": [],
					"sessionid": id
				});
				
				// initialize all timers (setting elapsed time to 0)
				QBSteps.loop(function(value, idx){
					session.get("elapsedTimers")[value.name]=0
				});
				
				session.sync(id);
				
				userUpdateSessionInProgress(id);
				initQBSession();
				sessionId = id;
			};
			
			// a function to resume an existing brainstorming session
			var continueQuickBSession = function(id){
				session = new LocalStore({});
				
				// retrieve session document from couchDB
				var sessionCDB = new CouchDBStore();
				sessionCDB.setTransport(Config.get("Transport"));
				
				sessionCDB.sync("taiaut", id).then(function(){
					var doc = sessionCDB.toJSON();
					session.reset(JSON.parse(doc));
					session.sync(id);
					// set resume time if session is still in progress
					if (session.get("step") != "wrapup") {
						var now = new Date();
						session.set("resumeTime", now.getTime());
					}
					userUpdateSessionInProgress(id);
					initQBSession();
					sessionId = id;	
				});
				
	/*			// synchronize session document with existing one in local storage
				session.sync(id);
				// set resume time if session is still in progress
				if (session.get("step") != "wrapup") {
					var now = new Date();
					session.set("resumeTime", now.getTime());
				}
				userUpdateSessionInProgress(id);
				initQBSession();
				sessionId = id; */
			};
			
			QBHeader.show = function(event, node){
				if (node.classList.contains("qbstartingpoint")) QBStack.show("start");

				else if (node.classList.contains("qbstep")){
					var idx = node.getAttribute("data-model_id");
					if ((QBSteps.get(idx).status == "done") || (QBSteps.get(idx).status == "in progress")) QBStack.show(QBSteps.get(idx).name);
				};
			};
			
			bObserver.watch("start-session", function(type){
				if (type == "quick") startQuickBSession();
			});
			
			bObserver.watch("continue-session", function(sessionObject){
				if (sessionObject.type == "quick") continueQuickBSession(sessionObject.id);
			});
			
			bObserver.watch("start-completed", function(title, description){
				session.set("title", title);
				session.set("description", description);
				QBSteps.nextStep("start");
			});
			
			bObserver.watch("setup-completed", function(time, arrayChar, arrayContext, arrayProblem){
				session.get("elapsedTimers").setup = time;
				session.set("characters", arrayChar);
				session.set("contexts", arrayContext);
				session.set("problems", arrayProblem);
				QBSteps.nextStep("setup");
			});
			
			bObserver.watch("qbcraft1-completed", function(time, array){
				session.set("creativity1", array.concat());
				session.get("elapsedTimers").craft1 = time;
				QBSteps.nextStep("craft1");
			});
			
			bObserver.watch("scenario-completed", function(time, title, story, solution){
				session.get("elapsedTimers").scenario = time;
				session.set("scenario", [{"title": title, "story": story, "solution": solution}]);
				// save scenario document to couchDB -- only one to save => idx:0
				Utils.uploadSessionOutput("scenario", session.toJSON(), 0);
				QBSteps.nextStep("scenario");
			});
			
			bObserver.watch("tech-completed", function(time, array){
				session.get("elapsedTimers").tech = time;
				session.set("techno", [array.concat()]);
				QBSteps.nextStep("tech");
			});
			
			bObserver.watch("qbcraft2-completed", function(time, array){
				session.set("creativity2", array.concat());
				session.get("elapsedTimers").craft2 = time;
				QBSteps.nextStep("craft2");
			});
			
			bObserver.watch("idea-completed", function(time, jsonData){
				session.set("idea", [JSON.parse(jsonData)]);
				session.get("elapsedTimers").idea = time;
				
				// save idea document to couchDB -- only one to save => idx:0
				Utils.uploadSessionOutput("idea", session.toJSON(), 0);
				
				// At the end of the idea step the session is finished and moves to a recap screen --> compute and set duration of the session
				var now = new Date();
				session.set("duration", session.get("elapsedTime") + now.getTime() - session.get("resumeTime"));
				
				// we should compute and set the session score here when scoring is defined
				session.set("score", "");
				
				// set session status to completed
				session.set("status", "completed");
				
				// set session step to wrapup
				currentStep = "wrapup";
				QBSteps.updateStatus(currentStep);
				session.set("step", currentStep);
				
				// save session document in local storage and to couchDB
				session.sync(sessionId);
				SyncUtils.lsDocToCDB(session);
				
				// no need for autosave anymore
				clearInterval(savingTimer);
				
				// notify session wrapup to get latest session data (ie cards used during the session, score etc.)
				bObserver.notify("session-wrapup", session);
				
				// notify menu not to display continue option any longer and clear session in progress
				bObserver.notify("session-completed");
				userUpdateSessionInProgress();
				
				// move on to display wrapup screen
				QBStack.show(currentStep);
			});
			
			bObserver.watch("next-step", function(){
				QBSteps.nextStep(currentStep);
			});
			
			bObserver.watch("save-data", function(type, time, value){
				switch (type){
					case "start":
						session.set("title", value.title);
						session.set("description", value.description);
						break;
					case "qbcraft1":
						session.set("creativity1", value);
						session.get("elapsedTimers").craft1 = time;
						break;
					case "scenario":
						session.set("scenario", [{"title": value.title, "story": value.story, "solution": value.solution}]);
						session.get("elapsedTimers").scenario = time;
						break;
					case "qbtech":
						session.set("techno", [value]);
						session.get("elapsedTimers").tech = time;
						break;
					case "qbcraft2":
						session.set("creativity2", value);
						session.get("elapsedTimers").craft2 = time;
						break;
					case "idea":
						session.set("idea", [{"title": value.title, "description": value.description, "solution": value.solution, "visibility": value.visibility}])
				};
			});
			
			bObserver.watch("exit-brainstorming", function(){
				if (sessionId){
					
					// if session is not finished (ie step != wrapup) save data and upload session doc to couchDB
					
					if (session.get("step") != "wrapup"){
					
						// save session data
						bObserver.notify("save-event");

						// compute overall elapsed time since start of the session (a session can be resumed multiple times)
						var now = new Date();
						session.set("elapsedTime", session.get("elapsedTime") + now.getTime() - session.get("resumeTime"));
					
						// save session in localstorage
						session.sync(sessionId);
					
						// save it in couchDB as well
						SyncUtils.lsDocToCDB(session);
					
						// inform user
						alert("your session in progress will be saved");
					};
					// reset sessionId, clear savingTimer and exit
					sessionId = null;
					clearInterval(savingTimer);
					bObserver.notify("exit-confirmed");
				}
			});
			
			QBHeader.alive(Map.get("qbheader"));
			QB.alive(Map.get("quickbrainstormingstack"));
						
			return QB;			
		}
	});
