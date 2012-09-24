define("DeckContent", ["Stack", "Map", "Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Param", "Store", "CouchDBStore", "Config", "DeckOverview", "DeckCharacters", "DeckContexts", "DeckProblems", "DeckTechno"],
	function(Stack, Map, OObject, ModelPlugin, EventPlugin, Param, Store, CouchDBStore, Config, DeckOverview, DeckCharacters, DeckContexts, DeckProblems, DeckTechno){
		
		return function DeckContentConstructor(decksObserver){
			
			
			/*
			 * This UI is based on two parts: a header bar with some information and a menu to switch between different types of contents,
			 * and a stack to display said contents
			 */
			
			var deckContentHeader = new OObject();
			var header = new Store([
				{"status":""}, 
				{"title":""},
				{"label": "overview", "src":"images/library/overviewicon.png", "style": "background-color: white"},
				{"label": "characters", "src":"images/library/peopleicon.png", "style":"background-image: -webkit-linear-gradient(left bottom, whitesmoke 20%, slategray 80%);"},
				{"label": "contexts", "src":"images/library/contexticon.png", "style":"background-image: -webkit-linear-gradient(left bottom, whitesmoke 20%, slategray 80%);"},
				{"label": "problems", "src":"images/library/problemicon.png", "style":"background-image: -webkit-linear-gradient(left bottom, whitesmoke 20%, slategray 80%);"},
				{"label": "technologies", "src":"images/library/technoicon.png", "style":"background-image: -webkit-linear-gradient(left bottom, whitesmoke 20%, slategray 80%);"}
				]);
			var deckInfo = new Store({});
			var charList = [],
				contextList = [],
				problemList = [],
				technoList = [];
			var currentDeckId = Param.get("currentDeck");

			var deckContentStack = new Stack(Map.get("deckcontentstack"));
			deckContentStack.addAll({"deckOverview": DeckOverview(decksObserver), "deckCharacters": DeckCharacters(decksObserver), "deckContexts": DeckContexts(decksObserver), "deckProblems": DeckProblems(decksObserver), "deckTechno": DeckTechno(decksObserver)});

			//building the header UI
						
			deckContentHeader.plugins.addAll({
				"header" : new ModelPlugin(header, {
					setStyle: function(style){
						this.setAttribute("style", style);
					},
					setStatus: function(status){
						switch(status){
							case "active":
								this.setAttribute("style", "background: limegreen;");
								break;
							case "ok":
								this.setAttribute("style", "background: orange;");
								break;
							case "nok":
								this.setAttribute("style", "background: red;");
								break;
						}
					}
				}),
				"event": new EventPlugin(deckContentHeader)
			});
			
			deckContentHeader.show = function (event, node){
				
				// reset button styles
				header.loop(function(value, idx){
					if (idx>1) header.update(idx, "style", "background-image: -webkit-linear-gradient(left bottom, whitesmoke 20%, slategray 80%);")
				});
				
				//
				switch(node.getAttribute("data-header_id")){
					case "2":
						header.update(2, "style", "background-color: white;")
						deckContentStack.show("deckOverview");
						break;
					case "3":
						header.update(3, "style", "background-image: -webkit-linear-gradient(left bottom, lavender 10%, royalblue 70%);");
						deckContentStack.show("deckCharacters");
						break;
					case "4":
						header.update(4, "style", "background-image: -webkit-linear-gradient(left bottom, palegreen 10%, lime 70%);");
						deckContentStack.show("deckContexts");
						break;
					case "5":
						header.update(5, "style", "background-image: -webkit-linear-gradient(left bottom, lavenderblush 10%, crimson 70%);");
						deckContentStack.show("deckProblems");
						break;
					case "6":
						header.update(6, "style", "background-image: -webkit-linear-gradient(left bottom, lemonchiffon 10%, orange 70%);");
						deckContentStack.show("deckTechno");
						break;
				}
			}
			
			var displayDeck = function(id){
				
				var deckCDB = new CouchDBStore({});
				deckInfo.reset({});
				
				deckCDB.setTransport(Config.get("Transport"));
				
				deckCDB.sync("taiaut", id).then(function(){
					// get title
					header.update(1, "title", deckCDB.get("title"));
					deckInfo.set("title", deckCDB.get("title"))
					
					// get card lists
					charList = deckCDB.get("content").characters.concat();
					contextList = deckCDB.get("content").contexts.concat();
					problemList = deckCDB.get("content").problems.concat();
					technoList = deckCDB.get("content").techno.concat();
					
					// check if deck is complete and currently active and set status accordingly
					if ((charList.length == 0) || (contextList.length == 0) || (problemList.length == 0) || (technoList.length == 0)) header.update(0, "status", "nok")
					else (id == Param.get("currentDeck")) ? header.update(0, "status", "active") : header.update(0, "status", "ok");
					
					// get additional info for display
					deckInfo.set("description", deckCDB.get("description"));
					deckInfo.set("author", deckCDB.get("author"));
					deckInfo.set("date", deckCDB.get("date").concat());
					deckInfo.set("picture_url", deckCDB.get("picture_url"));
					
					// notify content stack
					decksObserver.notify("build-deckContent", [deckInfo, charList, contextList, problemList, technoList, id]);
				});	
			};
			
			decksObserver.watch("select-deck", function(deckId){
				displayDeck(deckId);
				currentDeckId = deckId;
				// show the new deck overview
				// reset button styles
				header.loop(function(value, idx){
					if (idx>1) header.update(idx, "style", "background-image: -webkit-linear-gradient(left bottom, whitesmoke 20%, slategray 80%);")
				});
				// highlight overview button
				header.update(2, "style", "background-color: white;");
				// and finally show overview
				deckContentStack.show("deckOverview");
			});
			
			decksObserver.watch("setToActive", function(){
				header.update(0, "status", "active");
				decksObserver.notify("activate", currentDeckId);
			});
			
			decksObserver.watch("show-active-cards", function(deckId, type){
				
				displayDeck(deckId);
				
				// reset button styles
				header.loop(function(value, idx){
					if (idx>1) header.update(idx, "style", "background-image: -webkit-linear-gradient(left bottom, whitesmoke 20%, slategray 80%);")
				});
				
				switch(type){
					case "char":
						header.update(3, "style", "background-image: -webkit-linear-gradient(left bottom, lavender 10%, royalblue 70%);");
						deckContentStack.show("deckCharacters");
						break;
					case "context":
						header.update(4, "style", "background-image: -webkit-linear-gradient(left bottom, palegreen 10%, lime 70%);");
						deckContentStack.show("deckContexts");
						break;
					case "problem":
						header.update(5, "style", "background-image: -webkit-linear-gradient(left bottom, lavenderblush 10%, crimson 70%);");
						deckContentStack.show("deckProblems");
						break;
					case "techno":
						header.update(6, "style", "background-image: -webkit-linear-gradient(left bottom, lemonchiffon 10%, orange 70%);");
						deckContentStack.show("deckTechno");
						break;
				}
			});


			// initialize with current active deck and overview screen
			displayDeck(currentDeckId);
			deckContentStack.show("deckOverview");
			deckContentHeader.alive(Map.get("deckcontentheader"));
		}
	});
