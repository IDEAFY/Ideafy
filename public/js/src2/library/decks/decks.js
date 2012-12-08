define("Ideafy/Library/Decks", ["Olives/OObject", "Map", "Ideafy/Library/DeckList", "Ideafy/Library/DeckView"],
        function(Widget, Map, DeckList, DeckView){
                
           return function MyDecksContructor(){
              
              // declaration     
              var _widget = new Widget(),
                  _deckList = new DeckList(),
                  _deckView = new DeckView();
              
              
              // setup
              _widget.alive(Map.get("decks"));
              
              _widget.reset = function(reset){
                      _deckList.reset();
                      _deckView.reset();
              };
              
              _widget.init = function init(){
                      _deckList.init();
                      _deckVew.init();
              };
              
              // return
              return _widget;
                   
           } ;    
                
        });