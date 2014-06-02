/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "Place.plugin", "Amy/Stack-plugin", "Store", "service/map", "./deckdetails", "./cardlist", "service/config", "./cardeditor/newcard", "./deck-share"],
        function(Widget, Model, Event, Place, Stack, Store, Map, DeckDetails, CardList, Config, NewCard, DeckShare){
                
                return function DeckViewConstructor($update){
                        
                        var deckView = new Widget(),
                            newCardUI = new NewCard($update),
                            deckShareUI = new DeckShare(),
                            cardMenu = new Store([
                                    {name: "characters", active: false, count:0},
                                    {name: "contexts", active: false, count:0},
                                    {name: "problems", active: false, count:0},
                                    {name: "techno", active: false, count:0}
                            ]),
                            innerStack = new Stack(),
                            deckTitle = "",
                            deckId = "";
                        
                        
                        deckView.plugins.addAll({
                                "cardmenu" : new Model(cardMenu, {
                                        setClass : function(name){
                                                (name) && this.classList.add(name);
                                        },
                                        setActive : function(active){
                                                (active)?this.classList.add("active"):this.classList.remove("active");
                                        }
                                }),
                                "place" : new Place({"newCard" : newCardUI, "shareDeck" : deckShareUI}),
                                "deckviewstack" : innerStack,
                                "deckviewevent" : new Event(deckView)
                        });
                        
                        deckView.template = '<div id="deckview" class="details"><div data-place="place: newCard"></div><div data-place="place: shareDeck"></div><ul class="card-menu" data-cardmenu="foreach"><li><div class="card-type" data-cardmenu = "bind: setClass, name; bind:setActive, active" data-deckviewevent="listen: touchstart, viewCards"></div><div class="card-count" data-cardmenu="bind:innerHTML, count"></div></li></li></ul><div id="deckviewstack" data-deckviewstack="destination"></div></div>';
                        
                        deckView.viewCards = function(event, node){
                                var id = node.getAttribute("data-cardmenu_id");
                                
                                cardMenu.loop(function(v,i){
                                        (i === parseInt(id)) ? cardMenu.update(i, "active", true):cardMenu.update(i, "active", false);        
                                }); 
                                innerStack.getStack().show(cardMenu.get(id).name);   
                        };
                        
                        deckView.editCard = function editCard(id, type){
                                newCardUI.reset(id, type, deckId, deckTitle);
                        };
                        
                        deckView.hideEditView = function hideEditView(){
                                newCardUI && newCardUI.close();        
                        };
                        
                        deckView.reset = function reset(deck, screen){
                                deckView.hideEditView();
                                deckShareUI.hide();
                                deckView.dom.setAttribute("style", "overflow-y: none;");
                                
                                ["details", "characters", "contexts", "problems", "techno"].forEach(function(val){
                                        innerStack.getStack().get(val).reset(deck);       
                                });
                                
                                deckId = deck._id;
                                deckTitle = deck.title;
                                cardMenu.reset([]);
                                
                                ["characters", "contexts", "problems", "techno"].forEach(function(type){
                                        if (deck.content[type][0] === "newcard"){
                                                cardMenu.alter("push", {name: type, active: false, count: deck.content[type].length-1});
                                        }
                                        else{
                                                cardMenu.alter("push", {name: type, active: false, count: deck.content[type].length});        
                                        }               
                                });
                                (screen) ? innerStack.getStack().show(screen) : innerStack.getStack().show("details");        
                        };
                        
                        deckView.init = function init(){
                        
                                // initialize inner stack
                                innerStack.getStack().add("details", new DeckDetails($update));
                                innerStack.getStack().add("characters", new CardList("characters", deckView.editCard, $update));
                                innerStack.getStack().add("contexts", new CardList("contexts", deckView.editCard, $update));
                                innerStack.getStack().add("problems", new CardList("problems", deckView.editCard, $update));
                                innerStack.getStack().add("techno", new CardList("techno", deckView.editCard, $update));
                        };
                        
                        Config.get("observer").watch("deck-share", function(deckId){
                                deckShareUI.reset(deckId);
                                deckShareUI.show();
                        });
                        
                        return deckView;
                        
                };
        });
