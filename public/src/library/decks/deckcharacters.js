define("DeckCharacters", ["Map", "Olives/OObject", "Store", "CouchDBStore", "Olives/Transport", "Config", "Olives/Model-plugin", "Olives/Event-plugin"], 
	function(Map, OObject, Store, CouchDBStore, Transport, Config, ModelPlugin, EventPlugin){
		
		return function DeckCharacters(decksObserver){
			
			var deckCharacters = new OObject();
			var allChars = new Store([]);
			var charDisplay = new Store([]);
			var pages = new Store([]);
			var dom = Map.get("deckcharacters");
			var currentSeq = 0;
			
			deckCharacters.plugins.addAll({
				"list": new ModelPlugin(charDisplay),
				"pages": new ModelPlugin(pages),
				"event": new EventPlugin(deckCharacters)
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
			
			var getAllCharacters = function(array){
				var charactersCDB = new CouchDBStore([]);
				charactersCDB.setTransport(Config.get("Transport"));
				
				charactersCDB.sync("taiaut", {keys: array}).then(function(){
					charactersCDB.loop(function(value, idx){
						allChars.alter("push", value);
					});
					displaySequence(0);
				});
			};
			
			var displaySequence = function(seq){
				var beg = 12*seq;
				var end = 11+12*seq;
				
				charDisplay.reset([]);
	
				allChars.loop(function(value, idx){
					if ((idx>=beg) && (idx <=end)) {
						charDisplay.alter("push", value);
						}
				});				
			};
			
			deckCharacters.display = function(event, node){
				
				var seq = node.getAttribute("data-pages_id");
				if (seq != currentSeq) {
					dom.querySelector(".pagesequence[data-pages_id='"+currentSeq+"']").classList.remove("activesequence");
					dom.querySelector(".pagesequence[data-pages_id='"+seq+"']").classList.add("activesequence");
					currentSeq = seq;
				}
				displaySequence(node.getAttribute("data-pages_id"));
				
			};
			
			deckCharacters.zoom = function(event, node){
				var id = charDisplay.get(node.getAttribute("data-list_id")).id;
				Config.get("observer").notify("display-popup", "library", "char", id);
			}
			
			decksObserver.watch("build-deckContent", function(contentArray){
				var idList = contentArray[1].concat();
				allChars.reset([]);
				pagination(idList.length);
				getAllCharacters(idList);				
			});
			
			deckCharacters.alive(dom);
			return deckCharacters;
			
		};
		
	});
