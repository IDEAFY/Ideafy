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
                    deckId,
                    model = new Store();
                    
                
                importCard.template = '<div class="importcard"><div class="importfrom"><label data-labels="bind:innerHTML, importfrom">Select deck to import from</label><select data-model="bind:setDecks, decks" data-importevent="listen: change, updateSelect"></select></div><div class="importlist"><legend>Selected deck</legend><ul data-selected="foreach"><li name="selected" data-selected="bind: setType, type; bind: innerHTML, title; bind: setSelected, selected" data-importevent="listen: mousedown, toggleSelect"></li></ul></div><div class="importarea"><button>Add/remove</button><button>Add all/remove all</button><button>Clear selection</button></div><div class="importlist"><legend>Working deck</legend><ul data-current="foreach"><li name="current" data-current="bind: setType, type; bind: innerHTML, title; bind: setSelected, selected" data-importevent="listen: mousedown, toggleSelect"></li></ul></div><div class="cancelmail" data-importevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-importevent="listen:touchstart, press; listen:touchend, upload" data-label="bind:innerHTML, savelbl">Save</div></div>';
                
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
                        "current" : new Model(currentDeck, {
                                setType : function(type){
                                        switch(type){
                                                case 1:
                                                        this.setAttribute("style", "background-image:url('../img/decks/characters.png'); color: #657b99;");
                                                        break;
                                                case 2: 
                                                        this.setAttribute("style", "background-image:url('../img/decks/context.png');color:#5f8f28;");
                                                        break;
                                                case 3:
                                                        this.setAttribute("style", "background-image:url('../img/decks/problem.png');color: #bd262c");
                                                        break;
                                                case 4:
                                                        this.setAttribute("style", "background-image:url('../img/decks/technology.png');color: #f27b3d;");
                                                        break;
                                                default:
                                                        break;
                                        }
                                },
                                setSelected : function(selected){
                                        (selected) ? this.classList.add("selected") : this.classList.remove("selected");
                                }
                        }),
                        "selected" : new Model(selectedDeck, {
                                setType : function(type){
                                        switch(type){
                                                case 1:
                                                        this.setAttribute("style", "background-image:url('../img/decks/characters.png'); color: #657b99;");
                                                        break;
                                                case 2: 
                                                        this.setAttribute("style", "background-image:url('../img/decks/context.png');color:#5f8f28;");
                                                        break;
                                                case 3:
                                                        this.setAttribute("style", "background-image:url('../img/decks/problem.png');color: #bd262c");
                                                        break;
                                                case 4:
                                                        this.setAttribute("style", "background-image:url('../img/decks/technology.png');color: #f27b3d;");
                                                        break;
                                                default:
                                                        break;
                                        }
                                },
                                setSelected : function(selected){
                                        (selected) ? this.classList.add("selected") : this.classList.remove("selected");
                                }
                        }),
                        "importevent" : new Event(importCard)
                });
                
                importCard.cancel = function(event, node){
                        $close();        
                };
                
                importCard.updateSelect = function(event, node){
                        var id = node.selectedIndex;
                        selectedDeck.reset([]);
                        importCard.getDeckCards(model.get("decks")[id]._id, selectedDeck);
                };
                
                importCard.toggleSelect = function(event, node){
                        var type = node.getAttribute("name"),
                            id = node.getAttribute("data-"+type+"_id"),
                            store, sel;
                        
                        if (type === "current"){
                                importCard.clearSelection("selected");
                                store = currentDeck;                
                        }
                        else{
                                importCard.clearSelection("current");
                                store = selectedDeck;        
                        }
                        
                        (store.get(id).selected) ? store.update(id, "selected", false) : store.update(id, "selected", true);
                };
                
                importCard.clearSelection = function(type){
                        var store;
                        (type === "current") ? store = currentDeck : store = selectedDeck;
                        store.loop(function(v,i){
                                if (v.selected && v.selected === true){
                                        store.update(i, "selected", false);
                                }        
                        });
                };
                
                // retrieve decks from which cards can be imported and store result
                importCard.getDecks = function getDecks($id){
                        
                        var cdb = new CouchDBBulkDocuments(),
                            keys = user.get("taiaut_decks").concat(user.get("custom_decks")),
                            promise = new Promise();
                        cdb.setTransport(transport);
                        cdb.sync(db, {keys : keys}).then(function(){
                              var lang = user.get("lang"), arr = [], i;
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
                                // remove current deck
                                for (i=arr.length-1; i>=0; i--){
                                        if (arr[i]._id === $id) arr.splice(i,1);
                                }
                                arr.sort(function(x,y){
                                        var a = x.title, b = y.title;
                                        if (a<b) return -1;
                                        if (a>b) return 1;
                                        if (a===b) return 0;
                                });
                                model.set("decks", arr.concat()); 
                                promise.fulfill();
                                cdb.unsync();
                        });
                        return promise;       
                };
                
                importCard.getDeckCards = function getDeckCards($deckId, store){
                        var cdb = new CouchDBView(),
                            promise = new Promise();
                        cdb .setTransport(transport);
                        
                        cdb.sync(db, "library", "_view/cards", {key: '"'+$deckId+'"'})
                        .then(function(){
                                var arr = [];
                                cdb.loop(function(v,i){
                                        arr.push({"id": v.value._id, "type": v.value.type, "title": v.value.title});                
                                });
                                arr.sort(function(x,y){
                                        var a = x.title, b = y.title;
                                        if (a<b) return -1;
                                        if (a>b) return 1;
                                        if (a===b) return 0;
                                });
                                store.reset(arr);
                                promise.fulfill();        
                        });
                        
                        return promise;
                };
                
                importCard.reset = function reset($deckId){
                        model.reset();
                        currentDeck.reset([]);
                        selectedDeck.reset([]);
                        importCard.dom.querySelector("select").selectedIndex = 0;
                        
                        deckId = $deckId;
                        
                        importCard.getDecks(deckId)
                        .then(function(){
                                importCard.getDeckCards(deckId, currentDeck);
                                importCard.getDeckCards(model.get("decks")[0]._id, selectedDeck);       
                        });
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
                CD = currentDeck;
                SD = selectedDeck;
                
                return importCard;
                   
           }
});