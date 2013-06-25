/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "Amy/Stack-plugin", "service/config", "Store"],
        function(Widget, Model, Event, Stack, Config, Store){
                
                return function NewCardConstructor(){

                        var newCard = new Widget(),
                            _contentStack = new Stack(),
                            cardDetails = new Store(),
                            labels = Config.get("labels");
                        
                        newCard.template= '<div id="card_creation" class="invisible"><div class="create_header"><div class="changetype"></div><div class="importcard"></div><div class="createheaderstack invisible"</div></div><div class="createcontentstack"></div></div>';
                            
                        // setup
                        newCard.plugins.addAll({
                                "label" : new Model(labels),
                                "newcardcontentstack" : _contentStack,
                                "newcardevent" : new Event(this)
                        });
                        
                        newCard.close = function close(event, node){
                                document.getElementById("card_creation").classList.add("invisible");
                        };
                        
                        newCard.reset = function reset($deckId, $type){
                                document.getElementById("card_creation").classList.remove("invisible");
                                console.log($deckId, $type, newCard.dom);               
                        };
                        
                        return newCard;     
                }
});
