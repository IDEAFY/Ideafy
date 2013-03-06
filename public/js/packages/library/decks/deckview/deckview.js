/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Amy/Stack-plugin", "Store", "service/map", "./deckdetails", "./cardlist", "service/config"],
        function(Widget, Model, Event, Stack, Store, Map, DeckDetails, CardList, Config){
                
                return function DeckViewConstructor(){
                        
                        var deckView = new Widget(),
                            cardMenu = new Store([
                                    {name: "characters", active: false},
                                    {name: "contexts", active: false},
                                    {name: "problems", active: false},
                                    {name: "techno", active: false}
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
                        
                        deckView.template = '<div><ul class="card-menu" data-cardmenu="foreach"><li data-cardmenu = "bind: setClass, name; bind:setActive, active" data-deckviewevent="listen: mousedown, viewCards"></li></li></ul><div id="deckviewstack" data-deckviewstack="destination"></div></div>';
                        
                        deckView.viewCards = function(event, node){
                                var id = node.getAttribute("data-cardmenu_id");
                                
                                cardMenu.loop(function(v,i){
                                        (i === parseInt(id)) ? cardMenu.update(i, "active", true):cardMenu.update(i, "active", false);        
                                }); 
                                innerStack.getStack().show(cardMenu.get(id).name);   
                        };
                        
                        deckView.reset = function reset(deck){
                                var lang = Config.get("user").get("lang"), displayDeck;
                                // check deck default language -- if it does not match user language look for a translation
                                /*if (!deck.default_lang || (deck.default_lang === lang)) {
                                        displayDeck = deck;
                                }
                                else {
                                        (deck.translations && deck.translations[lang]) ? displayDeck = deck.translations[lang] : displayDeck = deck;
                                }*/
                               displayDeck = deck;
                                ["details", "characters", "contexts", "problems", "techno"].forEach(function(value){
                                        innerStack.getStack().get(value).reset(displayDeck);        
                                });
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
                        
                        deckView.place(Map.get("deckview"));
                        
                        return deckView;
                        
                };
        });
