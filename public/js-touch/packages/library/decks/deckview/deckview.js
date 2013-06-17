/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "Amy/Stack-plugin", "Store", "service/map", "./deckdetails", "./cardlist", "service/config"],
        function(Widget, Model, Event, Stack, Store, Map, DeckDetails, CardList, Config){
                
                return function DeckViewConstructor(){
                        
                        var deckView = new Widget(),
                            cardMenu = new Store([
                                    {name: "characters", active: false, count:0},
                                    {name: "contexts", active: false, count:0},
                                    {name: "problems", active: false, count:0},
                                    {name: "techno", active: false, count:0}
                            ]),
                            innerStack = new Stack();
                        
                        
                        deckView.plugins.addAll({
                                "cardmenu" : new Model(cardMenu, {
                                        setClass : function(name){
                                                this.classList.add(name);
                                        },
                                        setActive : function(active){
                                                (active)?this.classList.add("active"):this.classList.remove("active");
                                        }
                                }),
                                "deckviewstack" : innerStack,
                                "deckviewevent" : new Event(deckView)
                        });
                        
                        deckView.template = '<div><ul class="card-menu" data-cardmenu="foreach"><li><div data-cardmenu = "bind: setClass, name; bind:setActive, active" data-deckviewevent="listen: touchstart, viewCards"></div><div class="card-count" data-cardmenu="bind:innerHTML, count"></div></li></li></ul><div id="deckviewstack" data-deckviewstack="destination"></div></div>';
                        
                        deckView.viewCards = function(event, node){
                                var id = node.getAttribute("data-cardmenu_id");
                                
                                cardMenu.loop(function(v,i){
                                        (i === parseInt(id)) ? cardMenu.update(i, "active", true):cardMenu.update(i, "active", false);        
                                }); 
                                innerStack.getStack().show(cardMenu.get(id).name);   
                        };
                        
                        deckView.reset = function reset(deck){
                                
                                ["details", "characters", "contexts", "problems", "techno"].forEach(function(value){
                                        innerStack.getStack().get(value).reset(deck);        
                                });
                                cardMenu.reset([
                                    {name: "characters", active: false, count: 0},
                                    {name: "contexts", active: false, count: 0},
                                    {name: "problems", active: false, count: 0},
                                    {name: "techno", active: false, count: 0}
                            ]);
                                innerStack.getStack().show("details");        
                        };
                        
                        deckView.init = function init(){
                        
                                // initialize inner stack
                                innerStack.getStack().add("details", new DeckDetails());
                                innerStack.getStack().add("characters", new CardList("characters"));
                                innerStack.getStack().add("contexts", new CardList("contexts"));
                                innerStack.getStack().add("problems", new CardList("problems"));
                                innerStack.getStack().add("techno", new CardList("techno"));
                        };
                        
                        return deckView;
                        
                };
        });
