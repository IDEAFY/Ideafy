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
                            transport = Config.get("transport"),
                            close = function(){
                                document.getElementById("card_creation").classList.add("invisible");        
                            },
                            updateDeck = function(cardType, cardId){
                                var promise = new Promise(),
                                    deckId = cardSetup.get("deckId"),
                                    deckCDB = new CouchDBDocument(),
                                    type = "characters"; // or contexts, problems, techno
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
                                deckCDB.setTransport(transport);
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
                            removeCard = function(cardId){
                                var cdb  = new CouchDBDocument(),
                                    promise = new Promise();
                                cdb.setTransport(transport); 
                                cdb.sync(Config.get("db"), cardId)
                                .then(function(){
                                        var deck = cdb.get("deck") | [], p = new Promise();
                                        deck.splice(deck.indexOf(cardSetup.get("deckId")), 1);
                                        
                                        // if there are other decks this card belongs to simply udated it and finish removal
                                        if (deck.length){
                                                cdb.set("deck", deck);
                                                cdb.upload()
                                                .then(function(){
                                                        p.fulfill();
                                                })
                                        }
                                        else{
                                                if (file.search("img/decks") === -1){
                                                        json = {type: "card", file: file}
                                                        transport.request("DeleteAttachment", json, function(result){
                                                                if (result !== "ok"){
                                                                        console.log(result);
                                                                }
                                                        });
                                                }
                                                cdb.remove()
                                                .then(function(){
                                                        p.fulfill();
                                                });
                                        }
                                        return p;
                                })
                                .then(function(){
                                        return promise;
                                });
                                return promise; 
                            },
                            addToDeck = function(cardId){
                                var cdb = new CouchDBDocument(),
                                    promise = new Promise();
                                cdb.setTransport(transport);
                                cdb.sync(Config.get("db"), cardId)
                                .then(function(){
                                        var deck = cdb.get("deck") || [];
                                        deck.push(cardSetup.get("deckId"));
                                        cdb.set("deck", deck);
                                        return cdb.upload();
                                })
                                .then(function(){
                                        promise.fulfill();
                                });
                                return promise;      
                            },
                            updateImport = function(content){
                                var promise = new Promise(),
                                    deckId = cardSetup.get("deckId"),
                                    cdb = new CouchDBDocument(),
                                    newContent ={
                                        characters: content.characters.concat(),
                                        contexts: content.contexts.concat(),
                                        problems: content.problems.concat(),
                                        techno: content.techno.concat()
                                    },
                                    toAdd = [], toRemove = [];
                                
                                console.log(JSON.stringify(content));
                                cdb.setTransport(transport);
                                
                                cdb.sync(Config.get("db"), deckId)
                                .then(function(){
                                        console.log("deck :", cdb.toJSON());
                                        var oldContent ={},
                                            trans,
                                            isTranslation = false;
                                            
                                        (cdb.get("translations")) ? trans = cdb.get("translations") : trans = {};
                                        
                                        // check if updated deck is a translation or not
                                        if (trans.hasOwnProperty(user.get("lang"))) isTranslation = true;
                                        
                                        // update deck content
                                        if (isTranslation){
                                                ["characters", "contexts", "problems", "techno"].forEach(function(type){
                                                        oldContent[type] = trans[user.get("lang")].content[type].concat();
                                                });
                                                trans[user.get("lang")].content = newContent;
                                                cdb.set("translations", trans);
                                        }
                                        else{
                                                ["characters", "contexts", "problems", "techno"].forEach(function(type){
                                                        console.log(type, cdb.get("content")[type]);
                                                        oldContent[type] = cdb.get("content")[type].concat();
                                                });
                                                cdb.set("content", newContent);
                                        }
                                        console.log("updated content : ", cdb.get("content"), "\noldcontent : ", JSON.strongify(oldContent));
                                        // modify added or removed cards (e.g. deck reference, deletion etc.)
                                        ["characters", "contexts", "problems", "techno"].forEach(function(type){
                                                var old = oldContent[type],
                                                    upd = content[type],
                                                    i,j,k,l;
                                                
                                                // first check removed
                                                for (i = 0, l=old.length; i<l; i++){
                                                        if (upd.indexOf(old[i]) < 0) toRemove.push(old[i]);
                                                }
                                                
                                                // then check additions
                                                for (j = 0, k = upd.length; j<k; j++){
                                                        if (old.indexOf(upd[j]) <0) toAdd.push(upd[j]);
                                                }
                                        });
                                        
                                        console.log("results : toAdd --> ", toAdd.join(", "), " \n toRemove --> ", toRemove.join(", "));
                                        toAdd.forEach(function(cardId){
                                                addToDeck(cardId);        
                                        });
                                        toRemove.forEach(function(cardId){
                                                removeCard(cardId);        
                                        });
                                        
                                        // upload deck document
                                        return cdb.upload();
                                })
                                .then(function(){      
                                        //when done call
                                        $update("updated", deckId, null);
                                        promise.fulfill();
                                });
                                return promise;        
                            },
                            editCard = new EditCard(updateDeck, close),
                            editChar = new EditChar(updateDeck, close),
                            importCard = new ImportCard(updateImport, close);
                        
                        newCard.template= '<div id="card_creation" class="invisible"><div class="header blue-dark" data-label="bind: innerHTML, cardeditor"></div><div class="create_header"><label data-label="bind:innerHTML, createnew"></label><select class="changetype" data-setup="bind: selectedIndex, type" data-newcardevent="listen: change, changeType"><option data-label="bind:innerHTML, char"></option><option data-label="bind:innerHTML, context"></option><option data-label="bind:innerHTML, problem"></option><option data-label="bind:innerHTML, techno"></option><option data-label="bind:innerHTML, importcard"></option></select></div><div class="createcontentstack" data-newcardcontentstack="destination"></div></div>';
                            
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
                        
                        newCard.changeType = function(event, node){
                                var idx = node.selectedIndex;
                                if (idx === 4){
                                        importCard.reset(cardSetup.get("deckId"));
                                        _contentStack.getStack().show("importcard");
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
                        
                        return newCard;     
                }
});
