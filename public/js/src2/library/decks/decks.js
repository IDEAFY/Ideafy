define("Ideafy/Library/Decks", ["Olives/OObject", "Map"],
        function(Widget, Map){
                
           return function MyDecksContructor(){
              
              // declaration     
              var _widget = new Widget();
              
              // setup
              _widget.alive(Map.get("decks"));
              
              // return
              return _widget;
                   
           } ;    
                
        });