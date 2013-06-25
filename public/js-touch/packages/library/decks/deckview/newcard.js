/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "Amy/Stack-plugin", "service/config", "Store"],
        function(Widget, Model, Event, Stack, Config, Store){
                
                function NewCardConstructor($close){

                        var newCard = new Widget(),
                            _contentStack = new Stack(),
                            cardDetails = new Store(),
                            labels = Config.get("labels");
                        
                        newCard.template= 'div <id="card_creation>"><div class="create_header"><div class="changetype"></div><div class="importcard"></div><div class="createheaderstack invisible"</div></div><div class="createcontentstack"></div></div>';
                            
                        // setup
                        newCard.plugins.addAll({
                                "label" : new Model(labels),
                                "newcardcontentstack" : _contentStack,
                                "newcardevent" : new Event(this)
                        });
                        
                        newCard.close = function(event, node){
                                $close();
                        };
                        
                        newCard.reset = function reset($deckId, $type){
                                        
                        };
                        
                        return newCard;     
                }
});
