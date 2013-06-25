/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "Amy/Stack-plugin", "service/config", "Store", "CouchDBDocument"],
        function(Widget, Model, Event, Stack, Config, Store, CouchDBDocument){
                
                return function NewCardConstructor(){

                        var newCard = new Widget(),
                            _contentStack = new Stack(),
                            cardSetup = new Store();
                            cardCDB = new CouchDBDocument(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            cardTemplate = {
                                    "_id": "",
                                    "default_lang": user.get("lang"),
                                    "title": "",
                                    "didYouKnow": "",
                                    "deck": [],
                                    "category": "",
                                    "coefficient": 1,
                                    "sources": [],
                                    "created_by": user.get("_id"),
                                    "created_on": [],
                                    "picture_credit": "",
                                    "type": null,
                                    "picture_file": ""
                            },
                            charTemplate = {
                                    "_id": "INT:aika",
                                    "default_lang": user.get("lang"),
                                    "title": "",
                                    "gender": 0,
                                    "age": 0,
                                    "firstname": "",
                                    "lastname": "",
                                    "location": "",
                                    "occupation": {
                                        "description": "",
                                        "details": [1,"",""]
                                    },
                                    "family": {"couple": 0, "children": 0},
                                    "leisure_activities": [{"name": "", "comment": ""}, {"name": "", "comment": ""}, {"name": "", "comment": ""}],
                                    "interests": [{"name": "", "comment": ""}, {"name": "", "comment": ""}, {"name": "", "comment": ""}],
                                    "comments": null,
                                    "type": 1,
                                    "deck": [],
                                    "created_by": user.get("_id"),
                                    "created_on": [],
                                    "picture_file": ""
                            };
                        
                        newCard.template= '<div id="card_creation" class="invisible"><div class="create_header"><select class="changetype"><option data-label="bind:innerHTML, char"></option><option data-label="bind:innerHTML, context"></option><option data-label="bind:innerHTML, problem"></option><option data-label="bind:innerHTML, techno"></option></select><div class="importcard"></div><div class="createheaderstack invisible"</div></div><div class="createcontentstack"></div></div>';
                            
                        // setup
                        newCard.plugins.addAll({
                                "label" : new Model(labels),
                                "setup" : new Model(cardSetup),
                                "newcardcontentstack" : _contentStack,
                                "newcardevent" : new Event(this)
                        });
                        
                        newCard.close = function close(event, node){
                                document.getElementById("card_creation").classList.add("invisible");
                        };
                        
                        newCard.reset = function reset($deckId, $type){
                                document.getElementById("card_creation").classList.remove("invisible");
                                console.log($deckId, $type, newCard.dom);
                                cardSetup.reset();
                                              
                        };
                        
                        newCard.init = function(){
                                // add UIs to innerStack        
                        };
                        
                        // init
                        
                        return newCard;     
                }
});
