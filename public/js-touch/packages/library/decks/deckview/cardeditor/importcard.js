/* 
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Bind.plugin", "Event.plugin", "Store", "CouchDBBulkDocuments", "CouchDBView", "Promise"],
        function(Widget, Config, Model, Event, Store, CouchDBBulkDocuments, CouchDBView, Promise){
           
           return function ImportCardConstructor($update, $close){
                   
                var importCard = new Widget(),
                    labels = Config.get("labels"),
                    user = Config.get("user"),
                    transport = Config.get("transport"),
                    db = Config.get("db"), 
                    currentDeck = new Store([]),
                    selectedDeck = new Store([]),
                    deckId, importableDecks,
                    model = new Store();
                    
                
                importCard.template = '<div class="importcard"><div class="importfrom"><label data-labels="bind:innerHTML, importfrom">Select deck to import from</label><select data-model="bind:setDecks, decks" data-settingsevent="listen: change, updateDeck"></select></div><div class="importlist"><ul>Deck card list</ul></div><div class="importarea"><button>Add/remove</button><button>Add all/remove all</button><button>Clear selection</button></div><div class="importlist"><ul>Current deck card list</ul></div><div class="cancelmail" data-importevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-importevent="listen:touchstart, press; listen:touchend, upload" data-label="bind:innerHTML, savelbl">Save</div></div>';
                
                importCard.plugins.addAll({
                        "label" : new Model(labels),
                        "model" : new Model(model,{
                                setDecks: function(decks){
                                        var i, l, res="", selected, idx;
                                        if (decks){
                                                for (i=0, l=decks.length; i<l; i++){
                                                        if (decks[i]._id !== deckId) res+="<option>"+decks[i].title+"</option>";
                                                }
                                        }
                                        this.innerHTML=res;
                                   }        
                        }),
                        "current" : new Model(currentDeck),
                        "selected" : new Model(selectedDeck),
                        "importevent" : new Event(importCard)
                });
                
                importCard.cancel = function(event, node){
                        $close();        
                };
                
                // retrieve decks from which cards can be imported and store result
                importCard.getDecks = function getDecks(){
                        
                        var cdb = new CouchDBBulkDocuments(),
                            keys = user.get("taiaut_decks").concat(user.get("custom_decks"));
                        cdb.setTransport(transport);
                        cdb.sync(db, {keys : keys}).then(function(){
                              var lang = user.get("lang"), arr = [];
                              cdb.loop(function(v, i){
                                        if (v.doc.public || (v.doc.created_by === user.get("_id")) || (v.doc.sharedwith && v.doc.sharedwith.indexOf(user.get("_id")))){
                                                if (!v.doc.default_lang || (v.doc.default_lang === lang)) {
                                                        arr.push(v.doc);
                                                }
                                                else {
                                                        (v.doc.translations && v.doc.translations[lang]) ? arr.push(v.doc.translations[lang]) : arr.push(v.doc);
                                                }
                                        }
                                });
                                arr.sort(function(x,y){
                                        var a = x.title, b = y.title;
                                        if (a<b) return -1;
                                        if (a>b) return 1;
                                        if (a===b) return 0;
                                });
                                importableDecks = arr.concat();
                                model.set("decks", arr); 
                                cdb.unsync();
                        });       
                };
                
                importCard.getDeckCards = function getDeckCards($deckId, store){
                        var cdb = new CouchdbView(),
                            promise = new Promise();
                        cdb .setTransport(transport);
                        
                        cdb.sync(db, "library", "_view/cards", {key: $deckId})
                        .then(function(){
                                console.log(cdb.toJSON());
                                promise.fulfill();        
                        });
                        
                        return promise;
                };
                
                importCard.reset = function reset($deckId){
                        model.reset();
                        
                        deckId = $deckId;
                        
                        (importableDecks) ? model.set("decks", importableDecks) : importCard.getDecks();
                        
                        importCard.getDeckCards(deckId, currentDeck);
                };
                
                // if user decks are updated update the list of decks as well
                user.watchValue("taiaut_decks", function(){
                        importCard.getDecks();        
                });
                
                user.watchValue("custom_decks", function(){
                        importCard.getDecks();
                });
                
                user.watchValue("lang", function(){
                        importCard.getDecks();        
                });
                
                IMPORTMODEL = model;
                
                return importCard;
                   
           }
});