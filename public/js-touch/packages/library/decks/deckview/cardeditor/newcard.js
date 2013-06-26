/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "Amy/Stack-plugin", "service/config", "Store", "CouchDBDocument", "./editchar", "./editcard", "./importcard"],
        function(Widget, Model, Event, Stack, Config, Store, CouchDBDocument, EditChar, EditCard, ImportCard){
                
                return function NewCardConstructor(){

                        var newCard = new Widget(),
                            _contentStack = new Stack(),
                            cardSetup = new Store();
                            cardCDB = new CouchDBDocument(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            editCard = new EditCard(),
                            editChar = new EditChar(),
                            importCard = new ImportCard();
                        
                        newCard.template= '<div id="card_creation" class="invisible"><div class="header blue-dark" data-label="bind: innerHTML, cardeditor"></div><div class="create_header"><label data-label="bind:innerHTML, createnew"></label><select class="changetype" data-setup="bind: selectedIndex, type"><option data-label="bind:innerHTML, char"></option><option data-label="bind:innerHTML, context"></option><option data-label="bind:innerHTML, problem"></option><option data-label="bind:innerHTML, techno"></option></select><label data-label="bind:innerHTML, orlbl"></label><div class="importcard" data-label="bind:innerHTML, import" data-newcardevent="listen:touchstart, press; listen:touchend, import">Import...</div></div><div class="createcontentstack" data-newcardcontentstack="destination"></div></div>';
                            
                        // setup
                        newCard.plugins.addAll({
                                "label" : new Model(labels),
                                "setup" : new Model(cardSetup),
                                "newcardcontentstack" : _contentStack,
                                "newcardevent" : new Event(newCard)
                        });
                        
                        newCard.close = function close(event, node){
                                document.getElementById("card_creation").classList.add("invisible");
                        };
                        
                        newCard.reset = function reset($cardId, $cardType, $deckId, $deckTitle){
                                document.getElementById("card_creation").classList.remove("invisible");
                                console.log($cardId, $cardType, $deckId, $deckTitle);
                                cardSetup.reset({title: $deckTitle, type: ["characters", "contexts", "problems", "techno"].indexOf($cardType)});
                                
                                if ($cardType === "characters"){
                                        editChar.reset("new");
                                        _contentStack.getStack().show("editchar");
                                }
                                else{
                                        editCard.reset("new", $cardType);
                                        _contentStack.getStack().show("editcard");
                                }
                        };
                        
                        newCard.press = function(event, node){
                                node.classList.add("pressed");
                        }
                        
                        newCard.import = function(event, node){
                                node.classList.remove("pressed");
                                _contentStack.getStack().show("importcard");
                        }
                        
                        newCard.init = function(){
                                // add UIs to innerStack
                                _contentStack.getStack().add("editchar", editChar);
                                _contentStack.getStack().add("editcard", editCard); 
                                _contentStack.getStack().add("importcard", importCard);
                                
                                _contentStack.getStack().show("editchar");      
                        };
                        
                        // init
                        newCard.init();
                        
                        return newCard;     
                }
});
