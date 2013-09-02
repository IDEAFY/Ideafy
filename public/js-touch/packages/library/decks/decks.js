/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Amy/Stack-plugin", "Amy/Control-plugin", "Event.plugin", "Place.plugin", "service/config", "service/map", "./decklist/decklist", "./deckview/deckview", "./newdeck"],
        function(Widget, Model, Stack, Control, Event, Place, Config, Map, List, DeckView, NewDeck){
                
           return function MyDecksContructor(){
              
              // declaration     
              var widget = new Widget(),
                  deckControl = new Control(widget),
                  user = Config.get("user"),
                  currentSelected,
                  stack = new Stack(),  // in the future will allow to display taiaut decks or custom decks or search decks
                  ideafyDecks, customDecks, taiautDecks,
                  displayDeck = function(deckId){
                        var listUI = stack.getStack().getCurrentScreen(),
                            list = listUI.getModel();
                        
                        currentSelected = listUI.highlightDeck(deckControl.init, deckId);
                        deckView.reset(list.get(currentSelected));
                  },
                  newdeck = false,
                  currentId,
                  deckUpdate = function(update, deckId, cardType){
                        var listUI;
                        currentId = deckId;
                        if (update === "new") {
                                newdeck = true;
                                currentId = deckId;
                        }
                        if (update === "updated"){
                                listUI = stack.getStack().getCurrentScreen();
                                listUI.reset(function(sync){
                                        if (sync){
                                                listUI.highlightDeck(deckControl.init, deckId);
                                                deckView.reset(listUI.getModel().get(currentSelected), cardType);        
                                        }
                                });        
                        }             
                  },
                  deckView = new DeckView(deckUpdate), newDeck = new NewDeck(deckUpdate);
              
              
              widget.plugins.addAll({
                                "label" : new Model(Config.get("labels")),
                                "deckliststack" : stack,
                                "decksevent" : new Event(widget),
                                "deckplace" : new Place({"deckView": deckView, "newDeck": newDeck}),
                                "deckscontrol" : deckControl
              });
              
              widget.template = '<div id="decks"><div id="decklist" class="list"><div class="header blue-light"><div class="option left" data-deckscontrol=""></div><span data-label="bind: innerHTML, decklistheadertitle"></span><div class="option right" data-decksevent="listen: touchstart, plus"></div></div><div class="overflow" data-deckliststack="destination" data-deckscontrol="radio:li,selected,touchstart,selectStart"></div></div><div data-deckplace="place:deckView"></div><div data-deckplace="place:newDeck"></div></div>';
              
              // setup
              
              widget.reset = function reset(){
                      ideafyDecks.reset(function(sync){
                              if (sync){
                                      stack.getStack().show("ideafy");
                                      ideafyDecks.highlightDeck(deckControl.init,0);
                                      deckView.reset(ideafyDecks.getModel().get(0));
                                      currentSelected = 0;
                              }
                      });
              };
              
              widget.displayDeck = displayDeck;
              
              widget.init = function init(){
                      // init UIs
                      ideafyDecks = new List("all_decks");
                      // taiautDecks = new List("taiaut_decks"); -- in App purchase of official decks
                      // customDecks = new List("custom_decks"); -- feature not available in the first release
                      
                      stack.getStack().add("ideafy", ideafyDecks);
                      
                      // initial view should show active deck as highlighted and active deck content in the view
                      ideafyDecks.init(function(sync){
                              if (sync){
                                      // show all decks
                                      stack.getStack().show("ideafy");
                                      deckView.init();
                                      ideafyDecks.highlightDeck(deckControl.init,0);
                                      DV = deckView;
                                      deckView.reset(ideafyDecks.getModel().get(0), "details");
                                      currentSelected = 0;
                              };
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
              
              // event management
              
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
              user.watchValue("custom_decks", function(newValue, action, oldValue){
                        ideafyDecks.reset(function(sync){
                                var list;
                                if (sync && newdeck){
                                        displayDeck(currentId);
                                }
                                else if (sync && (newValue.length < oldValue.length)){
                                        list = ideafyDecks.getModel();
                                        if (list.getNbItems()){
                                                ideafyDecks.initSelected(deckControl.init,0);
                                                deckView.reset(list.get(0));
                                                currentSelected = 0;
                                        }
                                }
                                newdeck = false;       
                        });
                        // customDecks.getDecks($type);
                        
              });
                        
              user.watchValue("taiaut_decks", function(newValue, action, oldValue){
                         ideafyDecks.reset(function(sync){
                                 if (sync){
                                         ideafyDecks.initSelected(deckControl.init,0);
                                         deckView.reset(ideafyDecks.getModel().get(0));
                                 }
                         });
                        // taiautDecks.getDecks($type);       
              });
              
              // return
              return widget;
                   
           };    
                
        });