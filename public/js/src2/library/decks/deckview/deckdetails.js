define("Ideafy/Library/DeckDetails", ["Olives/OObject", "Config"],
        function(Widget, Config){
                
                return function DeckDetailsConstructor(){
                 
                        var deckDetails = new Widget();
                        
                        deckDetails.template = '<div>Deck details</div>';
                        
                        deckDetails.reset = function reset(deck){
                                
                        };
                        
                        return deckDetails;
                };
        });
