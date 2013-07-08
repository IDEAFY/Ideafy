/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "Amy/Stack-plugin", "service/config", "Store", "CouchDBDocument", "./editchar", "./editcard", "./importcard", "Promise"],
        function(Widget, Model, Event, Stack, Config, Store, CouchDBDocument, EditChar, EditCard, ImportCard, Promise){
                
                return function NewCardConstructor($update){

                        var newCard = new Widget(),
                            _contentStack = new Stack(),
                            cardSetup = new Store();
                            cardCDB = new CouchDBDocument(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            close = function(){
                                document.getElementById("card_creation").classList.add("invisible");        
                            },
                            updateDeck = function(cardType, cardId){
                                var promise = new Promise(),
                                    deckId = cardSetup.get("deckId"),
                                    deckCDB = new CouchDBDocument(),
                                    type = "characters"; // or contexts, problems, techno
                                console.log("deck update function in newcard : ", cardType, cardId, deckId);
                                switch(cardType){
                                        case 1:
                                                type = "characters";
                                                break;
                                        case 2:
                                                type = "contexts";
                                                break;
                                        case 3:
                                                type = "problems";
                                                break;
                                        case 4:
                                                type = "techno";
                                                break;
                                        default:
                                                console.log("no type detected");
                                                break;
                                }
                                deckCDB.setTransport(Config.get("transport"));
                                deckCDB.sync(Config.get("db"), deckId)
                                .then(function(){
                                        var now=new Date(),
                                            content = deckCDB.get("content"),
                                            arr = content[type];
                                        
                                        if (arr.indexOf(cardId)<0){
                                                arr.push(cardId);
                                                content[type] = arr;
                                                deckCDB.set("content", content);
                                        }
                                        deckCDB.set("last_updated", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                        return deckCDB.upload(); 
                                })
                                .then(function(){
                                        // update list and deckview
                                        deckCDB.unsync();
                                        $update("updated", deckId, cardType);
                                        promise.fulfill();
                                });
                                return promise;        
                            },
                            editCard = new EditCard(updateDeck, close),
                            editChar = new EditChar(updateDeck, close),
                            importCard = new ImportCard(updateDeck, close);
                        
                        newCard.template= '<div id="card_creation" class="invisible"><div class="header blue-dark" data-label="bind: innerHTML, cardeditor"></div><div class="create_header"><label data-label="bind:innerHTML, createnew"></label><select class="changetype" data-setup="bind: selectedIndex, type" data-newcardevent="listen: change, changeType"><option data-label="bind:innerHTML, char"></option><option data-label="bind:innerHTML, context"></option><option data-label="bind:innerHTML, problem"></option><option data-label="bind:innerHTML, techno"></option></select></div><div class="createcontentstack" data-newcardcontentstack="destination"></div></div>';
                        
                        // newCard.template= '<div id="card_creation" class="invisible"><div class="header blue-dark" data-label="bind: innerHTML, cardeditor"></div><div class="create_header"><label data-label="bind:innerHTML, createnew"></label><select class="changetype" data-setup="bind: selectedIndex, type" data-newcardevent="listen: change, changeType"><option data-label="bind:innerHTML, char"></option><option data-label="bind:innerHTML, context"></option><option data-label="bind:innerHTML, problem"></option><option data-label="bind:innerHTML, techno"></option></select><label data-label="bind:innerHTML, orlbl"></label><div class="importcard" data-label="bind:innerHTML, import" data-newcardevent="listen:touchstart, press; listen:touchend, import">Import...</div></div><div class="createcontentstack" data-newcardcontentstack="destination"></div></div>';
                            
                        // setup
                        newCard.plugins.addAll({
                                "label" : new Model(labels),
                                "setup" : new Model(cardSetup),
                                "newcardcontentstack" : _contentStack,
                                "newcardevent" : new Event(newCard)
                        });
                        
                        newCard.close = close;
                        
                        newCard.reset = function reset($cardId, $cardType, $deckId, $deckTitle){
                                document.getElementById("card_creation").classList.remove("invisible");
                                console.log($cardId, $cardType, $deckId, $deckTitle);
                                cardSetup.reset({deckId: $deckId, title: $deckTitle, type: ["characters", "contexts", "problems", "techno"].indexOf($cardType)});
                                
                                if ($cardType === "characters"){
                                        editChar.reset($deckId, $cardId);
                                        _contentStack.getStack().show("editchar");
                                }
                                else{
                                        editCard.reset($deckId, $cardId, $cardType);
                                        _contentStack.getStack().show("editcard");
                                }
                        };
                        
                        newCard.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        newCard.import = function(event, node){
                                node.classList.remove("pressed");
                                _contentStack.getStack().show("importcard");
                        };
                        
                        newCard.changeType = function(event, node){
                                var idx = node.selectedIndex;
                                if (_contentStack.getStack().getCurrentName() === "importcard"){
                                        importCard.changeType(idx);
                                }
                                else if (idx === 0){
                                        editChar.reset(cardSetup.get("deckId"), "newcard");
                                        _contentStack.getStack().show("editchar");
                                }
                                else {
                                        editCard.reset(cardSetup.get("deckId"), "newcard", cardSetup.get("type"));
                                        _contentStack.getStack().show("editcard");
                                        editCard.changeType(idx);
                                }
                        };
                        
                        newCard.init = function(){
                                
                                // add UIs to innerStack
                                _contentStack.getStack().add("editchar", editChar);
                                _contentStack.getStack().add("editcard", editCard); 
                                _contentStack.getStack().add("importcard", importCard);
                                
                                //_contentStack.getStack().show("editchar");      
                        };
                        
                        // init
                        newCard.init();
                        
                        CSTACK = _contentStack;
                        
                        return newCard;     
                }
});
