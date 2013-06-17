/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Amy/Stack-plugin", "Amy/Control-plugin", "Amy/Delegate-plugin", "service/config", "service/map", "./decklist/decklist", "./deckview/deckview"],
        function(Widget, Model, Stack, Control, Delegate, Config, Map, List, DeckView){
                
           return function MyDecksContructor(){
              
              // declaration     
              var widget = new Widget(),
                  deckControl = new Control(widget),
                  user = Config.get("user"),
                  currentSelected,
                  stack = new Stack(),  // in the future will allow to display taiaut decks or custom decks or search decks
                  ideafyDecks, customDecks,
                  deckView = new DeckView();
              
              
              widget.plugins.addAll({
                                "label" : new Model(Config.get("labels")),
                                "deckliststack" : stack,
                                "decksevent" : new Delegate(widget),
                                "deckscontrol" : deckControl
              });
              
              widget.template = '<div id="decks"><div id="decklist" class="list"><div class="header blue-light"><div class="option left" data-deckscontrol=""></div><span data-label="bind: innerHTML, decklistheadertitle"></span><div class="option right" data-decksevent="listen: touchstart, plus"></div></div><div class="overflow" data-deckliststack="destination" data-deckscontrol="radio:li,selected,touchstart,selectStart"></div></div><div id="deckview" class="details"></div></div>';
              
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
              
              widget.init = function init(){
                      
                      ideafyDecks = new List("taiaut_decks");
                          // customDecks = new List("custom_decks"); -- feature not available in the first release
                      
                      stack.getStack().add("ideafy", ideafyDecks);
                      
                      // initial view should show active deck as highlighted and active deck content in the view
                      ideafyDecks.init(function(sync){
                              if (sync){
                                      stack.getStack().show("ideafy");
                                      deckView.init();
                                      ideafyDecks.initSelected(deckControl.init,0);
                                      deckView.reset(ideafyDecks.getModel().get(0));
                                      currentSelected = 0;
                              }
                      });
              };
              
              widget.selectStart = function(event){
                        var list = stack.getStack().getCurrentScreen().getModel(),
                            id = event.target.getAttribute("data-decks_id");
                        deckView.reset(list.get(id));
                        currentSelected = id;
              };
              
              widget.plus = function(event, node){
                        alert("deck addiction");
                                
              };
              
              
              // init
              widget.init();
              
              
              // watch for language change
              user.watchValue("lang", function(){
                              var name = stack.getStack().getCurrentName(), currentDeckList, deckListUI = stack.getStack().getCurrentScreen();
                              switch(name){
                                    case "custom":
                                          currentDeckList = "custom_decks";
                                          break;
                                    default:
                                          currentDeckList = "taiaut_decks";
                                          break;
                              }
                              deckListUI.getDecks(currentDeckList, function(sync){
                                   if (sync){
                                                  deckListUI.initSelected(deckControl.init,currentSelected);
                                                  deckView.reset(deckListUI.getModel().get(currentSelected));
                                   }
                              });      
              });
              
              // return
              return widget;
                   
           } ;    
                
        });