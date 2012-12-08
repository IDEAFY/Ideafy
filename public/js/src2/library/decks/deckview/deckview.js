define("Ideafy/Library/DeckView", ["Olives/OObject", "Map"],
        function(Widget, Map){
                
                return function DeckViewConstructor(){
                        
                        var deckView = new Widget();
                        
                        deckView.template = '<div><div class="header blue-dark"></div></div>';
                        
                        deckView.place(Map.get("deckview"));
                        
                        deckView.reset = function reset(){
                                
                        };
                        
                        deckView.init = function init(){
                                
                        };
                        
                        return deckView;
                        
                };
        });
