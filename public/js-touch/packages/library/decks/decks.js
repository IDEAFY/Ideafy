/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Amy/Stack-plugin", "Amy/Control-plugin", "Event.plugin", "Place.plugin", "service/config", "service/map", "./decklist/decklist", "./deckview/deckview", "./newdeck", "CouchDBDocument"],
        function(Widget, Model, Stack, Control, Event, Place, Config, Map, List, DeckView, NewDeck, CouchDBDocument){
                
           return function MyDecksContructor(){
              
              // declaration     
              var widget = new Widget(),
                  deckControl = new Control(widget),
                  user = Config.get("user"),
                  currentSelected,
                  stack = new Stack(),  // in the future will allow to display taiaut decks or custom decks or search decks
                  ideafyDecks, customDecks, taiautDecks,
                  deckView = new DeckView(), newDeck = new NewDeck();
              
              
              widget.plugins.addAll({
                                "label" : new Model(Config.get("labels")),
                                "deckliststack" : stack,
                                "decksevent" : new Event(widget),
                                "deckplace" : new Place({"deckView": deckView, "newDeck": newDeck}),
                                "deckscontrol" : deckControl
              });
              
              widget.template = '<div id="decks"><div id="decklist" class="list"><div class="header blue-light"><div class="option left" data-deckscontrol=""></div><span data-label="bind: innerHTML, decklistheadertitle"></span><div class="option right" data-decksevent="listen: touchstart, plus"></div></div><div class="overflow" data-deckliststack="destination" data-deckscontrol="radio:li,selected,touchstart,selectStart"></div></div><div id="deckview" data-deckplace="place:deckView" class="details"></div><div data-deckplace="place:newDeck"></div></div>';
              
              // setup
              
              widget.reset = function reset(){
                      ideafyDecks.reset(function(sync){
                              if (sync){
                                      stack.getStack().show("ideafy");
                                      ideafyDecks.initSelected(deckControl.init,0);
                                      deckView.reset(ideafyDecks.getModel().get(0));
                                      currentSelected = 0;
                              }
                      });
              };
              
              widget.displayDeck = function displayDeck(deckId){
                        var listUI = stack.getStack().getCurrentScreen(),
                            list = listUI.getModel(),
                            current_elem, new_elem, position = null;
                        
                        // check position of deck in the list
                        list.loop(function(v,i){
                                if (v._id === deckId){
                                        position = i;
                                }        
                        });
                        
                        console.log("display deck called", deckId, position);
                        
                        if (position !== null){
                                listUI.initSelected(deckControl.init, position);
                                current_elem = widget.dom.querySelector("li[data-decks_id='"+currentSelected+"']");
                                new_elem = widget.dom.querySelector("li[data-decks_id='"+position+"']");
                                console.log(currnet_elem, new_elem);
                                // clear current selection
                                current_elem.classList.remove("selected");
                                // select new deck, display and re-init control plugin
                                new_elem.classList.add("selected");
                                elem.scrollIntoView();
                                deckView.reset(list.get(position));
                                
                                deckControl.init(new_elem);
                                currentSelected = position;
                        }
                                
              };
              
              widget.init = function init(){
                      ideafyDecks = new List("all_decks");
                      // taiautDecks = new List("taiaut_decks"); -- in App purchase of official decks
                      // customDecks = new List("custom_decks"); -- feature not available in the first release
                      
                      stack.getStack().add("ideafy", ideafyDecks);
                      
                      // show all decks
                     stack.getStack().show("ideafy");
                      // initial view should show active deck as highlighted and active deck content in the view
                      ideafyDecks.init(function(sync){
                              if (sync){
                                      deckView.init();
                                      ideafyDecks.initSelected(deckControl.init,0);
                                      deckView.reset(ideafyDecks.getModel().get(0));
                                      currentSelected = 0;
                              }
                              ideafyDecks.getModel().watch("added", function(deckId){
                                        console.log("added "+deckId);
                                        widget.displayDeck(deckId);        
                              });
                      });
              };
              
              widget.selectStart = function(event){
                        var list = stack.getStack().getCurrentScreen().getModel(),
                            id = event.target.getAttribute("data-decks_id");
                        deckView.reset(list.get(id));
                        currentSelected = id;
              };
              
              widget.plus = function(event, node){
                        newDeck.show();
              };
              
              
              // init
              widget.init();
              
              
              // watch for language change
              user.watchValue("lang", function(){
                              var name = stack.getStack().getCurrentName(), currentDeckList, deckListUI = stack.getStack().getCurrentScreen();
                              switch(name){
                                    case "taiaut":
                                          currentDeckList = "taiaut_decks";
                                    case "custom":
                                          currentDeckList = "custom_decks";
                                          break;
                                    default:
                                          currentDeckList = "all_decks";
                                          break;
                              }
                              deckListUI.getDecks(currentDeckList, function(sync){
                                   if (sync){
                                                  deckListUI.initSelected(deckControl.init,currentSelected);
                                                  deckView.reset(deckListUI.getModel().get(currentSelected));
                                   }
                              });      
              });
              
              // watch for changes for this particular type of decks in user doc 
              user.watchValue("custom_decks", function(){
                      
                        ideafyDecks.reset();
                        // customDecks.getDecks($type);
              });
                        
              user.watchValue("taiaut_decks", function(){
                         ideafyDecks.getDecks($type);
                        // taiautDecks.getDecks($type);       
              });
              
              
              
              USER = user;
              TSTCDB = new CouchDBDocument();
              DECKSTACK = stack;
              DELUSERDECKS = function(){
                      var count = null, l = user.get("custom_decks").length;
                      
                      user.get("custom_decks").forEach(function(id){
                                var cdb = new CouchDBDocument();
                                cdb.setTransport(Config.get("transport"));
                                
                                cdb.sync(Config.get("db"), id)
                                .then(function(){
                                        return cdb.remove();
                                })
                                .then(function(){
                                        var arr = user.get("custom_decks");
                                        arr.splice(1, arr.indexOf(id));
                                        user.set("custom_decks", arr);
                                        count++;
                                        if (count === l) {
                                                console.log("all custom decks removed");
                                        }
                                });
                      });
                      
              }
              // return
              return widget;
                   
           };    
                
        });