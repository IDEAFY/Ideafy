define("Ideafy/Library/DeckList", ["Olives/OObject", "Map"],
        function(Widget, Map){
                
                return function DeckListConstructor(){
                        
                        var deckList = new Widget();
                        
                        deckList.template = '<div><div class="header blue-light"></div></div>';
                        
                        deckList.place(Map.get("decklist"));
                        
                        deckList.reset = function reset(){
                                
                        };
                        
                        deckList.init = function init(){
                                
                        };
                        
                        return deckList;
                        
                };
        });