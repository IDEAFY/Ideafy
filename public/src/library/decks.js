define("Decks", ["Map", "Olives/OObject", "Observable", "ActiveDeck", "DeckList", "DeckContent"], 
	function(Map, OObject, Observable, ActiveDeck, DeckList, DeckContent){
	
		return function DecksConstructor(libraryInit){
			
			var decks = new OObject();
			var decksObserver = new Observable();
			
			decks.alive(Map.get("decks"));
			
			
			//initialize
			libraryInit.watch("startLibraryContent", function(){
				ActiveDeck(decksObserver);
				DeckList(decksObserver);
				DeckContent(decksObserver);
			});	
			
			return decks;
			
			
		};
	
});
