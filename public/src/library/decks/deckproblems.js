define("DeckProblems", ["Map", "Olives/OObject", "Store", "CouchDBStore", "Olives/Transport", "Config", "Olives/Model-plugin", "Olives/Event-plugin"], 
	function(Map, OObject, Store, CouchDBStore, Transport, Config, ModelPlugin, EventPlugin){
		
		return function DeckProblems(decksObserver){
			
			var deckProblems = new OObject();
			var allProblems = new Store([]);
			var problemDisplay = new Store([]);
			var pages = new Store([]);
			var dom = Map.get("deckproblems");
			var currentSeq = 0;
			
			deckProblems.plugins.addAll({
				"list": new ModelPlugin(problemDisplay),
				"pages": new ModelPlugin(pages),
				"event": new EventPlugin(deckProblems)
			});
			
			var pagination = function(length){
				pages.reset([]);
				// build pagination
				var nbPages = Math.floor(length/12);
				if (nbPages != length/12) nbPages++;

				if (nbPages>1) {
					for (i=0; i<nbPages; i++){
						var beg = 12*i;
						var end = 11+12*i;
						(i == nbPages-1) ? pages.alter("push", {"seq" : beg+" - "+ length}) : pages.alter("push", {"seq" : beg+" - "+end});
					}
					currentSeq=0;
					dom.querySelector(".pagesequence[data-pages_id='0']").classList.add("activesequence");
				} 
			};
			
			var getAllProblems = function(array){
				var problemsCDB = new CouchDBStore([]);
				problemsCDB.setTransport(Config.get("Transport"));
				
				problemsCDB.sync("taiaut", {keys: array}).then(function(){
					problemsCDB.loop(function(value, idx){
						allProblems.alter("push", value);
					});
					displaySequence(0);
				});
			};
			
			var displaySequence = function(seq){
				var beg = 12*seq;
				var end = 11+12*seq;
				
				problemDisplay.reset([]);
	
				allProblems.loop(function(value, idx){
					if ((idx>=beg) && (idx <=end)) {
						problemDisplay.alter("push", value);
						}
				});				
			};
			
			deckProblems.display = function (event,node){
				
				var seq = node.getAttribute("data-pages_id");
				if (seq != currentSeq) {
					dom.querySelector(".pagesequence[data-pages_id='"+currentSeq+"']").classList.remove("activesequence");
					dom.querySelector(".pagesequence[data-pages_id='"+seq+"']").classList.add("activesequence");
					currentSeq = seq;
				}
				displaySequence(node.getAttribute("data-pages_id"));
				
			};
			
			deckProblems.zoom = function(event, node){
				var id = problemDisplay.get(node.getAttribute("data-list_id")).id;
				Config.get("observer").notify("display-popup", "library", "problem", id);
			}
			
			decksObserver.watch("build-deckContent", function(contentArray){
				var idList = contentArray[3].concat();
				allProblems.reset([]);
				pagination(idList.length);
				getAllProblems(idList);				
			});
			
			deckProblems.alive(dom);
			return deckProblems;
			
		};
		
	});
