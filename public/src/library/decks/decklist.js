define("DeckList", ["Map", "Olives/OObject", "CouchDBStore", "Olives/Transport", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Utils"],
	function(Map, OObject, CouchDBStore, Transport, Config, ModelPlugin, EventPlugin, Utils){
		
		return function DeckListConstructor(decksObserver){
			
			var decks = [];
			var td = Config.get("user").get("taiaut_decks").concat();
			(Config.get("user").get("custom_decks")) ? decks = td.concat(Config.get("user").get("custom_decks")) : decks = td;
			var deckListCDB = new CouchDBStore([]);
			var deckList = new OObject(deckListCDB);
			
			deckListCDB.setTransport(Config.get("Transport"));

			deckList.plugins.addAll({
				"decks": new ModelPlugin(deckListCDB, {
					truncate : function displayFirstSentence(desc) {					
						if (desc) Utils.displayFirstSentence(this, desc);
					},
					formatDate: function (date) {
						if (date) this.innerHTML = (date[1]+1) + " / " + date[0];
					}
				}),
				"event": new EventPlugin(deckList)
			});
			deckListCDB.sync("taiaut", {keys: decks});
			
			deckList.select = function(event, node){
				var idx = node.getAttribute("data-decks_id");
				decksObserver.notify("select-deck", deckListCDB.get(idx).id);
			};
			
			deckList.alive(Map.get("decklist"));
						
			return deckList;
		}
	})
