define("DeckTechno", ["Map", "Olives/OObject", "Store", "CouchDBStore", "Olives/Transport", "Config", "Olives/Model-plugin", "Olives/Event-plugin"], 
	function(Map, OObject, Store, CouchDBStore, Transport, Config, ModelPlugin, EventPlugin){
		
		return function DeckTechno(decksObserver){
			
			var deckTechno = new OObject();
			var allTechno = new Store([]);
			var technoDisplay = new Store([]);
			var pages = new Store([]);
			var dom = Map.get("decktechno");
			var currentSeq = 0;
			
			deckTechno.plugins.addAll({
				"list": new ModelPlugin(technoDisplay),
				"pages": new ModelPlugin(pages),
				"event": new EventPlugin(deckTechno)
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
			
			var getAllTechno = function(array){
				var technoCDB = new CouchDBStore([]);
				technoCDB.setTransport(Config.get("Transport"));
				
				technoCDB.sync("taiaut", {keys: array}).then(function(){
					technoCDB.loop(function(value, idx){
						allTechno.alter("push", value);
					});
					displaySequence(0);
				});
			};
			
			var displaySequence = function(seq){
				var beg = 12*seq;
				var end = 11+12*seq;
				
				technoDisplay.reset([]);
	
				allTechno.loop(function(value, idx){
					if ((idx>=beg) && (idx <=end)) {
						technoDisplay.alter("push", value);
						}
				});				
			};
			
			deckTechno.display = function (event,node){
				
				var seq = node.getAttribute("data-pages_id");
				if (seq != currentSeq) {
					dom.querySelector(".pagesequence[data-pages_id='"+currentSeq+"']").classList.remove("activesequence");
					dom.querySelector(".pagesequence[data-pages_id='"+seq+"']").classList.add("activesequence");
					currentSeq = seq;
				}
				displaySequence(node.getAttribute("data-pages_id"));
				
			};
			
			deckTechno.zoom = function(event, node){
				var id = technoDisplay.get(node.getAttribute("data-list_id")).id;
				console.log(id);
				Config.get("observer").notify("display-popup", "library", "techno", id);
			}
			
			decksObserver.watch("build-deckContent", function(contentArray){
				var idList = contentArray[4].concat();
				allTechno.reset([]);
				pagination(idList.length);
				getAllTechno(idList);				
			});
			
			deckTechno.alive(dom);
			return deckTechno;
			
		};
		
	});
