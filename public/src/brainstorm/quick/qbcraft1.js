define("QBCraft1", ["Olives/OObject", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Param"],
	function(OObject, Map, Store, ModelPlugin, EventPlugin, Config, Param){
		
		return function QBCraft1Constructor(bObserver){
			
			// the UI object
			var QBCraft1 = new OObject();
			
			// a store to give easy access to review the cards drawn during the previous step
			var setupCards = new Store([
				{"type": "char", "id": ""},
				{"type": "context", "id": ""},
				{"type": "problem", "id": ""}
			]);
			
			/*
			 * The whiteboard consists in a place where users can stick post-it notes
			 * Post-its come in five different colors. To create visual effect color is chosen randomly
			 * as well as the position attribute.
			 * There can be up to 12 post-its per page
			 * A navigation bar is added at the bottom if the number exceeds 12
			 */ 
			var postItBG = [
				"background-image: url('/images/brainstorm/bluepostit.png');",
				"background-image: url('/images/brainstorm/greenpostit.png');",
				"background-image: url('/images/brainstorm/orangepostit.png');",
				"background-image: url('/images/brainstorm/pinkpostit.png');",
				"background-image: url('/images/brainstorm/yellowpostit.png');"
			];
			var bgPos = [
				"background-position: center;",
				"background-position: left;",
				"background-position: right;",
				"background-position: top;",
				"background-position: bottom;"];
			var postIts = new Store([]);
			var postItDisplay = new Store([]);
			var postItPages = new Store([]);
			var nbPages = 1;
			var currentPage = 0;
			
			// variables used to build the user table
			var pencils = new Store([]);
			var postItColor;
			
			// postItNote itself
			var postItNote = new Store({"content": "", "color": ""});
			var checkedOut = -1; // a variable used to track id of checked out postit (edit or delete mode)
			
			// adding a store to manage the timer for the "craft1" step and display of the next button
			var timer = Param.get("quickB").timers[Param.get("quickB").steps.indexOf("craft1")];
			var qbCraftTimer;
			var interval = 1000;
			var display = new Store({
				"isCurrentStep": false,
				"navBar": false,
				"nextVisible": false,
				"timer": timer
			});
			
			// usertable interface --> will be hidden once the creativity phase is completed
			var userTable = document.querySelector(".ut1");
			
			QBCraft1.plugins.addAll({
				"cards": new ModelPlugin(setupCards,{
					setCard : function(id){
						if (id) {
							this.innerHTML = id;
							switch(this.getAttribute("data-cards_id")){
								case "0":
									this.setAttribute("style", "background:blue");
									break;
								case "1":
									this.setAttribute("style", "background:green");
									break;
								case "2":
									this.setAttribute("style", "background:red");
									break;
							};
						}
					}
				}),
				"postit": new ModelPlugin(postItDisplay, {
					setStyle : function(style){
						if (style) this.setAttribute("style", style);
					}
				}),
				"page": new ModelPlugin(postItPages, {
					setSelected : function(selected){
						(selected) ? this.classList.add("selected") : this.classList.remove("selected");
					}
				}),
				"pencils": new ModelPlugin(pencils, {
					setColor : function(color){
						var idx = this.getAttribute("data-pencils_id");
						var style;
						(pencils.get(idx).active)? style="background:"+color+";border: 2px solid white;": style="background:"+color+";border: 2px solid "+color+";";
						this.setAttribute("style", style);
					}
				}),
				"note": new ModelPlugin(postItNote,{
					setColor : function(color){
						if (color) this.setAttribute("style", "color:"+color);
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
				"event": new EventPlugin(QBCraft1)
			});
			
			var getSetupCards = function (arr1, arr2, arr3){
				if (arr1) setupCards.update(0, "id", arr1[0]); //Add char id
				if (arr2) setupCards.update(1, "id", arr2[0]); //Add context id
				if (arr3) setupCards.update(2, "id", arr3[0]); //Add problem id
			};
			
			var getStyle = function(){
				var style;
				var bg_idx = Math.floor(Math.random()*postItBG.length);
				var pos_idx = Math.floor(Math.random()*bgPos.length);
				style = "color:"+postItColor+";"+postItBG[bg_idx] + bgPos[pos_idx];
				return style;
			};
			
			var displayPage = function(pageIndex){
				postItDisplay.reset([]);
				if (postIts.getNbItems()>0) postIts.loop(function(value, idx){
					if ((idx >= 12*pageIndex) && (idx<12*pageIndex+12)) postItDisplay.alter("push", value);
				});
			};
			
			var initTimer = function(){
				var updateTimer = function(){
					var time = display.get("timer");
					(time >=0) ? display.set("timer", time-interval ) : display.set("timer", 0);
					if (display.get("timer") == 0) {
						clearInterval(qbCraftTimer);
						userTable.classList.add("invisible");
						display.set("nextVisible", true);
					}
				};
				qbCraftTimer = setInterval(updateTimer, interval);
			};
			
			var updateDisplay = function(index){
				
				// if less than 12 post-its currently displayed add the new one to the list
				if (postItDisplay.getNbItems()<12) postItDisplay.alter("push", postIts.get(index))
				else{
					// reset page navigation
					postItPages.loop(function(item, idx){postItPages.update(idx, "selected", false)});
				
					//get page number
					var pageIndex = Math.floor(index/12);
				
					// create a new navigation bullet
					postItPages.alter("push", {"selected": true});
					displayPage(pageIndex);
					currentPage = pageIndex;
					nbPages = postItPages.getNbItems();
					if (nbPages>1) display.set("navBar", true);
				}
			};
			
			var createNavBar = function(){
				(postIts.getNbItems()) ? nbPages = Math.floor((postIts.getNbItems()-1)/12)+1 : nbPages = 1;
				for (i=0; i<nbPages; i++) postItPages.alter("push", {"selected": false});
				
				// display navbar if more than one page
				if (nbPages >1) display.set("navBar", true);
				
				// highlight first page by default
				postItPages.update(0, "selected", true);
				currentPage = 0;
			};
			
			var savePostIts = function(){
				var data = new Array();
				postIts.loop(function(value, idx){
					data.push(value);
				});
				return data;
			};
			
			QBCraft1.zoom = function(event, node){
				var idx = node.getAttribute("data-cards_id");
				switch (idx) {
					case "0":
						Config.get("observer").notify("display-popup","brainstorm", "char", setupCards.get(idx).id);
						break;
					case "1":
						Config.get("observer").notify("display-popup","brainstorm", "context", setupCards.get(idx).id);
						break;
					case "2":
						Config.get("observer").notify("display-popup","brainstorm", "problem", setupCards.get(idx).id);
						break;
				}
			};
			
			QBCraft1.showPage = function(event, node){
				var idx = node.getAttribute("data-page_id");
				postItPages.loop(function(item, idx){postItPages.update(idx, "selected", false)});
				postItPages.update(idx, "selected", true);
				displayPage(idx);
				currentPage = idx;
			};
			
			QBCraft1.selectPencil = function(event, node){
				var idx = node.getAttribute("data-pencils_id");
				postItColor = pencils.get(idx).color;
				postItNote.set("color", postItColor);
				pencils.loop(function(value, index){
					(index == idx)? pencils.update(index, "active", true) : pencils.update(index, "active", false);
				});
			};
			
			QBCraft1.createNote = function(event, node){
				if (postItNote.get("content").length >1){
					
					if (checkedOut<0){
						// new post-it : display post-it and reinitialize textarea
						postIts.alter("push", {"content": postItNote.get("content"), "color": postItColor, "style": getStyle()});
						updateDisplay(postIts.getNbItems()-1);
						postItNote.reset({"content": "", "color": ""});
					
						// check if there are 2 postits or more and if yes display next button
						if (postIts.getNbItems() >1) display.set("nextVisible", true);
					}
					else {
						// updated postIt --> change content in postIts and postItDisplay
						// get current page, add checkedOut, alter postIts & postItDisplay, reset checkedOut
						postIts.update(12*currentPage+checkedOut, "content", postItNote.get("content"));
						postIts.update(12*currentPage+checkedOut, "color", postItColor);
						var style = getStyle();
						postIts.update(12*currentPage+checkedOut, "style", style);
						postItDisplay.update(checkedOut, "content", postItNote.get("content"));
						postItDisplay.update(checkedOut, "color", postItColor);
						postItDisplay.update(checkedOut, "style", style);
						checkedOut = -1;
						postItNote.reset({"content": "", "color": ""});
					}
				}
			};
			
			QBCraft1.checkout = function(event, node){
				// only allow checkout during current step if there is time left 
				if ((display.get("isCurrentStep")) && (display.get("timer") >0)){
				node.setAttribute("style", "opacity: 0.1;");
				checkedOut = node.getAttribute("data-postit_id");
				postItNote.set("content", postItDisplay.get(checkedOut).content);
				postItNote.set("color", postItDisplay.get(checkedOut).color);
				}
			};
			
			QBCraft1.clearNote = function(event, node){
				postItNote.reset({"content": "", "color": postItColor});
			};
			
			QBCraft1.removeNote = function(event, node){
				var idx = eval(checkedOut) + 12*currentPage;
				postItDisplay.del(checkedOut);
				postIts.del(idx);
				console.log("index: ", idx, " after: ", postItDisplay.getNbItems(), postIts.getNbItems());
				if ((postItDisplay.getNbItems() == 0) && (currentPage > 0)){
					postItPages.alter("splice", currentPage, 1);
					currentPage = currentPage - 1;
					postItPages.update(currentPage, "selected", true);
					if (currentPage == 0) display.set("navBar", false);
					displayPage(currentPage);
				};
				checkedOut = -1;
				postItNote.reset({"content": "", "color": ""});
			};
			
			QBCraft1.next = function(event, node){
				clearInterval(qbCraftTimer);
				var data = savePostIts();
				var time = timer-display.get("timer")
				bObserver.notify("qbcraft1-completed", time, data);
				display.set("isCurrentStep", false);
				display.set("timer", time);
				userTable.classList.add("invisible");
				display.set("nextVisible", false);
			};
			
			/*
			 * Setup-completed event: the previous step (card selection) has just been completed
			 * retrieve card ids and display them on the board
			 * an improvement would be to retrieve card titles --> ok if in localstore
			 */
			
			bObserver.watch("setup-completed", function(time, arr1, arr2, arr3){
				getSetupCards(arr1, arr2, arr3);
				if (userTable.classList.contains("invisible")) userTable.classList.remove("invisible");
				initTimer();
				display.set("isCurrentStep", true);
			});
			
			/*
			 * Session-started event: read the session document and display existing data if any
			 */
			
			bObserver.watch("session-started", function(store){
				
				// reset interface and timer
				pencils.reset([
				{"color": "black", "active": true},
				{"color": "darkblue", "active": false},
				{"color": "darkgreen", "active": false},
				{"color": "red", "active": false}
				]);
				postItColor = pencils.get(0).color;
				postIts.reset([]);
				postItDisplay.reset([]);
				timer = Param.get("quickB").timers[Param.get("quickB").steps.indexOf("craft1")];
				
				// retrieve cards drawn during the setup phase
				// types are separated if we decide to do save them separately in the future
				var arr1, arr2, arr3;
				(store.get("characters")) ? arr1 = store.get("characters").concat() : arr1=[];
				(store.get("contexts")) ? arr2 = store.get("contexts").concat() : arr2=[];
				(store.get("problems")) ? arr3 = store.get("problems").concat() : arr3=[];
				getSetupCards(arr1, arr2, arr3);
				
				// retrieve postits
				var array = [];
				if (store.get("creativity1")) array= store.get("creativity1").concat();
				if (array.length>0){
					for (i=0; i<array.length; i++){
						postIts.alter("push", array[i]);
					};
				};
				
				// check if current step and manage display accordingly
				if (store.get("step") != "craft1") {
					display.set("isCurrentStep", false);
					display.set("nextVisible", false);
					var elapsed = store.get("elapsedTimers").craft1;
					(elapsed >0) ? display.set("timer", elapsed) : display.set("timer", timer);
					userTable.classList.add("invisible");
				}
				else{
					display.set("isCurrentStep", true);
					if (userTable.classList.contains("invisible")) userTable.classList.remove("invisible");
					display.set("timer", timer-store.get("elapsedTimers").craft1);
					if (postIts.getNbItems() > 1) display.set("nextVisible", true);
					initTimer();
				};
				createNavBar();
				
				// initialize : show first post-it page
				displayPage(0);
			});
			
			bObserver.watch("save-event", function(){
				if (display.get("isCurrentStep")){
					var data = savePostIts();
					bObserver.notify("save-data", "qbcraft1", timer - display.get("timer"), data);
				};
			});
			
			bObserver.watch("exit-confirmed", function(){
				clearInterval(qbCraftTimer);
				pencils.reset([]);
				postIts.reset([]);
				postItDisplay.reset([]);
				postItPages.reset([]);
			});

			
			QBCraft1.alive(Map.get("qbcraft1"));
			
			return QBCraft1;
			
		};
		
	})
