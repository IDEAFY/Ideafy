define ("ActiveDeck", ["Olives/OObject", "Map", "Param", "CouchDBStore", "Olives/Transport", "Config", "Olives/Model-plugin", "Olives/Event-plugin"],
	function(OObject, Map, Param, CouchDBStore, Transport, Config, ModelPlugin, EventPlugin){
		
		return function ActiveDeckConstructor(decksObserver){
			
			var deckCDB = new CouchDBStore({});
			var activeDeck = new OObject(deckCDB);
			
			deckCDB.setTransport(Config.get("Transport"));
			
			activeDeck.plugins.addAll({
				"model": new ModelPlugin(deckCDB,{
					formatDate: function (date) {
						if (date) this.innerHTML = (date[1]+1) + " / " + date[0];
					}
				}),
				"event": new EventPlugin(activeDeck)
			});
			
			var getDeckInfo = function(deckId){
			
			deckCDB.unsync();	
			deckCDB.reset({});
			deckCDB.sync("taiaut", deckId);	
				
			}
			
			activeDeck.showCards = function (event, node){
				decksObserver.notify("show-active-cards", Param.get("currentDeck"), node.getAttribute("name"));
			}
			
			decksObserver.watch("activate", function(id){
				Param.set("currentDeck", id);
				getDeckInfo(id);
			})
			
			// initialize
			getDeckInfo(Param.get("currentDeck"));
			
			activeDeck.alive(Map.get("activedeck"));
			
			return activeDeck;
			
		};
		
	});
