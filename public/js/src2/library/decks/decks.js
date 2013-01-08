define("Ideafy/Library/Decks", ["Olives/OObject", "Amy/Stack-plugin", "Amy/Control-plugin", "Amy/Delegate-plugin", "Config", "Map", "Ideafy/Library/DeckList", "Ideafy/Library/DeckView"],
        function(Widget, Stack, Control, Delegate, Config, Map, List, DeckView){
                
           return function MyDecksContructor(){
              
              // declaration     
              var widget = new Widget(),
                  stack = new Stack(),  // in the future will allow to display taiaut decks or custom decks or search decks
                  deckList = new List(),
                  deckView = new DeckView();
              
              
              widget.plugins.addAll({
                                "deckliststack" : stack,
                                "decksevent" : new Delegate(widget),
                                "deckscontrol" :new Control(widget)
              });
              
              // setup
              widget.alive(Map.get("decks"));
              
              widget.reset = function(reset){
                      deckList.reset();
                      deckView.reset();
              };
              
              widget.init = function init(){
                      
                      var ideafyDecks = new List("taiaut_decks");
                          // customDecks = new List("custom_decks"); -- feature not available in the first release
                      
                      stack.getStack().add("ideafy", ideafyDecks);
                      
                      // initial view should show active deck as highlighted and active deck content in the view
                      ideafyDecks.init();
                      stack.getStack().show("ideafy");
                      deckView.init();
              };
              
              widget.selectStart = function(event){
                        var list = stack.getStack().getCurrentScreen().getModel(),
                            id = event.target.getAttribute("data-decks_id");
                        deckView.reset(list, id);
                                
                        };
              
              
              // init
              widget.init();
              
              // return
              return widget;
                   
           } ;    
                
        });