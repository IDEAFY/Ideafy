define("DeckOverview", ["Map", "Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Param"], 
	function(Map, OObject, ModelPlugin, EventPlugin, Param){
		
		return function DeckOverviewConstructor(decksObserver){
			
			var deckOverview = new OObject();
			var dom = Map.get("deckoverview");
			var activateButton = dom.querySelector(".deckactivate");
			
			deckOverview.plugins.addAll({
				"model": new ModelPlugin(deckOverview.model, {
					formatDate: function(date){
						if (date) this.innerHTML= new Date(date[0],date[1], date[2]).toDateString();
					}
				}),
				"event": new EventPlugin(deckOverview)
			});
			
			deckOverview.setActive = function(){
				decksObserver.notify("setToActive");
				dom.querySelector(".deckactivate").classList.add("invisible");
			};
			
			decksObserver.watch("build-deckContent", function(contentArray){
				deckOverview.model.reset({});
				deckOverview.model.set("title", contentArray[0].get("title"));
				deckOverview.model.set("description", contentArray[0].get("description"));
				deckOverview.model.set("picture_url", contentArray[0].get("picture_url"));
				deckOverview.model.set("authorlbl", "Designed by ");
				deckOverview.model.set("author", contentArray[0].get("author"));
				deckOverview.model.set("date", contentArray[0].get("date"));
				
				//if deck is incomplete (ie. does not contain at least one card of each type), then hide the select button
				if ((contentArray[1].length == 0) || (contentArray[2].length == 0) || (contentArray[3].length == 0) || (contentArray[4].length == 0)) activateButton.classList.add("invisible");
				
				//if deck is currently active also hide the activate button
				(contentArray[5] == Param.get("currentDeck")) ? activateButton.classList.add("invisible") : activateButton.classList.remove("invisible");
			});
			
			deckOverview.alive(dom);
			
			return deckOverview;
		}
	});
