define("QBCraft2", ["Olives/OObject", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Param", "CouchDBStore", "Olives/Transport"],
	function(OObject, Map, Store, ModelPlugin, EventPlugin, Config, Param, CouchDBStore, Transport){
		
		return function QBCraft2Constructor(bObserver){
			
			// the UI object
			var QBCraft2 = new OObject();
			
			var techCards = new Store([]);
			var scenario = {"title": "", "story": "", "solution": "", "authors": "", "date": ""};
			var options = new Store([
				{"name": "italic", "checked": false},
				{"name": "bold", "checked": false}
			]);
			var draft = new Store({"draft":"", "style":""});
			var proposals = new Store([]);
			var displayProposals = new Store([]);
			var proposalPages = new Store([]);
			var nbPages = 1;
			var currentPage = 0;
			var checkedOut = -1; // a variable used to track id of checked out proposal (edit or delete)
			
			// adding a store to manage the timer for the "craft2" step and display of the next button
			var timer = Param.get("quickB").timers[Param.get("quickB").steps.indexOf("craft2")];
			var qbCraftTimer;
			var interval = 1000;
			var display = new Store({
				"isCurrentStep": false,
				"navBar": false,
				"nextVisible": false,
				"timer": timer,
				"scenarioTitle": ""
			});
			
			// usertable interface --> will be hidden once the creativity phase is completed
			var userTable = document.querySelector(".ut2");
			
			QBCraft2.plugins.addAll({
				"cards": new ModelPlugin(techCards),
				"options": new ModelPlugin(options, {
					setLabel : function(name){
						var idx = this.getAttribute("data-options_id");
						this.innerHTML = name;
						(options.get(idx).checked == true) ? this.setAttribute("style", "color: blue;") : this.setAttribute("style", "color: black;");
					}
				}),
				"draft": new ModelPlugin(draft, {
					setStyle : function(style){
						if (style) this.setAttribute("style", style);
					}
				}),
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
					}
				}),
				"proposal": new ModelPlugin(displayProposals, {
					setSyle: function(style){
						if (style) this.setAttribute("style", style);
					}
				}),
				"page": new ModelPlugin(proposalPages, {
					setSelected : function(selected){
						(selected) ? this.classList.add("selected") : this.classList.remove("selected");
					}
				}),
				"event": new EventPlugin(QBCraft2)
			});
			
			
			var createNavBar = function(){
				(proposals.getNbItems())? nbPages = Math.floor((proposals.getNbItems()-1)/2)+1 : nbPages = 1;
				for (i=0; i<nbPages; i++) proposalPages.alter("push", {"selected": false});
				
				// display navbar if more than one page
				if (nbPages >1) display.set("navBar", true);
				
				// highlight first page by default
				proposalPages.update(0, "selected", true);
				currentPage = 0;
			};
			
			var displayPage = function(pageIndex){
				displayProposals.reset([]);
				if (proposals.getNbItems()>0) proposals.loop(function(value, idx){
					if ((idx >= 2*pageIndex) && (idx<2*pageIndex+1)) displayProposals.alter("push", value);
				});
			};
			
			var getStyle = function(){
				var style = "";
				(options.get(0).checked) ? style = "font-style: italic;" : style = "font-style: normal;";
				(options.get(1).checked) ? style = style + "font-weight: bold;" : style = style + "font-weight: normal";
				console.log(style);
				return style;
			};
			
			var getTechCards = function(idList){
				techCards.reset([]);
				if (idList.length>0){
					var techCDB = new CouchDBStore([]);
					techCDB.setTransport(Config.get("Transport"));
					techCDB.sync("taiaut", {keys: idList}).then(function(){
						techCDB.loop(function(value, idx){
							techCards.alter("push", {"title": value.doc.title, "id": value.doc._id});
						});
					});
				}
			};

			var initTimer = function(){
				var updateTimer = function(){
					var time = display.get("timer");
					(time >=0) ? display.set("timer", time-interval ) : display.set("timer", 0);
					
					if (display.get("timer") == 0) {
						clearInterval(qbCraftTimer);
						// if time runs out and user is currently writing a proposal, then let he can finish writing ans the table is hidden when he posts.
						if (draft.get("draft") == "") userTable.classList.add("invisible");
					}
				};
				qbCraftTimer = setInterval(updateTimer, interval);
			};
			
			var saveProposals = function(){
				var data = new Array();
				proposals.loop(function(value, idx){
					data.push(value);
				});
				return data;
			};
			
			var updateDisplay = function(index){
				// if less than 12 post-its currently displayed add the new one to the list
				if (displayProposals.getNbItems()<2) displayProposals.alter("push", proposals.get(index))
				else{
					// reset page navigation
					proposalPages.loop(function(item, idx){proposalPages.update(idx, "selected", false)});
				
					//get page number
					var pageIndex = Math.floor(index/2);
				
					// create a new navigation bullet
					proposalPages.alter("push", {"selected": true});
					displayPage(pageIndex);
					currentPage = pageIndex;
					nbPages = proposalPages.getNbItems();
					if (nbPages>1) display.set("navBar", true);
				}
			};
			
			QBCraft2.checkout = function(event, node){

			};
			
			QBCraft2.clearDraft = function(event, node){
				draft.reset({"draft": "", "style": getStyle()});
			};
			
			QBCraft2.createProposal = function(event, node){
				var propal = new Object();
				if (draft.get("draft").length > 0) {
					propal.proposal = draft.get("draft");
					propal.style = getStyle();
					proposals.alter("push", propal);
					updateDisplay(proposals.getNbItems()-1);
					draft.reset({"draft":"", "style": propal.style});
					display.set("nextVisible", true);
					if (display.get("timer") == 0) userTable.classList.add("invisible");
				}
			};
			
			QBCraft2.displayScenario = function(event, node){
				Config.get("observer").notify("display-popup", "brainstorm", "scenario", scenario);
			};
			
			QBCraft2.next = function(event, node){
				clearInterval(qbCraftTimer);
				var data = saveProposals(),
				    time = timer-display.get("timer")
				bObserver.notify("qbcraft2-completed", time, data);
				display.set("isCurrentStep", false);
				display.set("timer", time);
				userTable.classList.add("invisible");
				display.set("nextVisible", false);
			};
			
			QBCraft2.removeProposal = function(event, node){
				
			};
			
			QBCraft2.showPage = function(event, node){
				var idx = node.getAttribute("data-page_id");
				proposalPages.loop(function(item, idx){proposalPages.update(idx, "selected", false)});
				proposalPages.update(idx, "selected", true);
				displayPage(idx);
				currentPage = idx;
			};
			
			QBCraft2.zoom = function(event, node){
				var idx = node.getAttribute("data-cards_id");
				Config.get("observer").notify("display-popup","brainstorm", "techno", techCards.get(idx).id);

			};
			
			/*
			 * Setup-completed event: the previous step (card selection) has just been completed
			 * retrieve card ids and display them on the board
			 * an improvement would be to retrieve card titles --> ok if in localstore
			 */
			
			bObserver.watch("scenario-completed", function(time, title, story, solution){
				
				// get scenario info
				scenario.title = title;
				scenario.story = story;
				scenario.solution = solution;
				
				// prepare display
				display.set("scenarioTitle", scenario.title);
			});
			
			bObserver.watch("tech-completed", function(time, arr){
				getTechCards(arr);
				if (userTable.classList.contains("invisible")) userTable.classList.remove("invisible");
				initTimer();
				display.set("isCurrentStep", true);
			});
			
			/*
			 * Session-started event: read the session document and display existing data if any
			 */
			
			bObserver.watch("session-started", function(store){
				
				// reset interface and timer
				proposals.reset([]);
				displayProposals.reset([]);
				options.reset([
					{"name": "italic", "checked": false},
					{"name": "bold", "checked": false}
				]);
				timer = Param.get("quickB").timers[Param.get("quickB").steps.indexOf("craft1")];
				
				// retrieve cards drawn during the setup phase
				// types are separated if we decide to do save them separately in the future
				var arr;
				(store.get("techno") && store.get("techno")[0]) ? arr = store.get("techno")[0].concat() : arr=[];
				getTechCards(arr);
				
				// retrieve scenario information and display card
				if (store.get("scenario")){
					scenario.title = store.get("scenario")[0].title;
					display.set("scenarioTitle", scenario.title);
					scenario.story = store.get("scenario")[0].story;
					scenario.solution = store.get("scenario")[0].solution;
				}
				
				// initialize scenario data (author & date)
				scenario.authors = Config.get("user").get("username");
				scenario.date = store.get("date").concat();
				
				// retrieve proposals
				var array = [];
				if (store.get("creativity2")) array= store.get("creativity2").concat();
				if (array.length>0){
					for (i=0; i<array.length; i++){
						proposals.alter("push", array[i]);
					}
				}
				
				
				// check if current step and manage display accordingly
				if (store.get("step") != "craft2") {
					display.set("isCurrentStep", false);
					display.set("nextVisible", false);
					var elapsed = store.get("elapsedTimers").craft2;
					(elapsed >0) ? display.set("timer", elapsed) : display.set("timer", timer);
					userTable.classList.add("invisible");
				}
				else{
					display.set("isCurrentStep", true);
					if (userTable.classList.contains("invisible")) userTable.classList.remove("invisible");
					display.set("timer", timer-store.get("elapsedTimers").craft1);
					initTimer();
				};
				
				// initialize : show first flipboard page
				createNavBar();
				displayPage(0);
			});
			
			bObserver.watch("save-event", function(){
				if (display.get("isCurrentStep")){
					var data = saveProposals();
					bObserver.notify("save-data", "qbcraft2", timer - display.get("timer"), data);
				};
			});
			
			bObserver.watch("exit-confirmed", function(){
				clearInterval(qbCraftTimer);
				options.reset([]);
				proposals.reset([]);
				displayProposals.reset([]);
				proposalPages.reset([]);
			});

			
			QBCraft2.alive(Map.get("qbcraft2"));
			
			return QBCraft2;
			
		};
		
	})
