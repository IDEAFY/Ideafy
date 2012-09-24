define("DeckContexts", ["Map", "Olives/OObject", "Store", "CouchDBStore", "Olives/Transport", "Config", "Olives/Model-plugin", "Olives/Event-plugin"], 
	function(Map, OObject, Store, CouchDBStore, Transport, Config, ModelPlugin, EventPlugin){
		
		return function DeckContexts(decksObserver){
			
			var deckContexts = new OObject();
			var allContexts = new Store([]);
			var contextDisplay = new Store([]);
			var pages = new Store([]);
			var dom = Map.get("deckcontexts");
			var currentSeq = 0;
			
			deckContexts.plugins.addAll({
				"list": new ModelPlugin(contextDisplay),
				"pages": new ModelPlugin(pages),
				"event": new EventPlugin(deckContexts)
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
			
			var getAllContexts = function(array){
				var contextsCDB = new CouchDBStore([]);
				contextsCDB.setTransport(Config.get("Transport"));
				
				contextsCDB.sync("taiaut", {keys: array}).then(function(){
					contextsCDB.loop(function(value, idx){
						allContexts.alter("push", value);
					});
					displaySequence(0);
				});
			};
			
			var displaySequence = function(seq){
				var beg = 12*seq;
				var end = 11+12*seq;
				
				contextDisplay.reset([]);
	
				allContexts.loop(function(value, idx){
					if ((idx>=beg) && (idx <=end)) {
						contextDisplay.alter("push", value);
						}
				});				
			};
			
			deckContexts.display = function (event,node){
				
				var seq = node.getAttribute("data-pages_id");
				if (seq != currentSeq) {
					dom.querySelector(".pagesequence[data-pages_id='"+currentSeq+"']").classList.remove("activesequence");
					dom.querySelector(".pagesequence[data-pages_id='"+seq+"']").classList.add("activesequence");
					currentSeq = seq;
				}
				displaySequence(node.getAttribute("data-pages_id"));
				
			};
			
			deckContexts.zoom = function(event, node){
				var id = contextDisplay.get(node.getAttribute("data-list_id")).id;
				Config.get("observer").notify("display-popup", "library", "context", id);
			}
			
			decksObserver.watch("build-deckContent", function(contentArray){
				var idList = contentArray[2].concat();
				allContexts.reset([]);
				pagination(idList.length);
				getAllContexts(idList);				
			});
			
			deckContexts.alive(dom);
			return deckContexts;
			
		};
		
	});
