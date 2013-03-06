/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Olives/Model-plugin", "Amy/Stack-plugin", "Amy/Control-plugin", "Amy/Delegate-plugin", "service/config", "service/map", "./decklist/decklist", "./deckview/deckview"],
        function(Widget, Model, Stack, Control, Delegate, Config, Map, List, DeckView){
                
           return function MyDecksContructor(){
              
              // declaration     
              var widget = new Widget(),
                  deckControl = new Control(widget),
                  stack = new Stack(),  // in the future will allow to display taiaut decks or custom decks or search decks
                  deckList = new List(),
                  deckView = new DeckView();
              
              
              widget.plugins.addAll({
                                "label" : new Model(Config.get("labels")),
                                "deckliststack" : stack,
                                "decksevent" : new Delegate(widget),
                                "deckscontrol" : deckControl
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
                      ideafyDecks.init(function(sync){
                              if (sync){
                                      stack.getStack().show("ideafy");
                                      deckView.init();
                                      ideafyDecks.initSelected(deckControl.init,0);
                                      deckView.reset(ideafyDecks.getModel().get(0));
                              }
                      });
              };
              
              widget.selectStart = function(event){
                        var list = stack.getStack().getCurrentScreen().getModel(),
                            id = event.target.getAttribute("data-decks_id");
                        deckView.reset(list.get(id));
              };
              
              
              // init
              widget.init();
              
              // return
              return widget;
                   
           } ;    
                
        });