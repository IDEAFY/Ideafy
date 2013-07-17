/* 
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Bind.plugin", "Event.plugin", "Store", "CouchDBBulkDocuments", "CouchDBView", "Promise", "lib/spin.min"],
        function(Widget, Config, Model, Event, Store, CouchDBBulkDocuments, CouchDBView, Promise, Spinner){
           
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
                    
                
                importCard.template = '<div class="importcard"><div class="importfrom"><label data-labels="bind:innerHTML, importfrom">Select deck to import from</label><select data-model="bind:setDecks, decks" data-importevent="listen: change, updateSelect"></select></div><div class="importlist"><legend>Selected deck</legend><ul name="selected" data-selected="foreach"><li name="selected" data-selected="bind: setType, type; bind: innerHTML, title; bind: setSelected, selected" data-importevent="listen: touchend, toggleSelect"></li></ul></div><div class="importarea"><button class="invisible" data-model="bind: setVisible, sel; bind: setDirection, direction" data-importevent="listen: touchend, addRemoveSelected">Add/remove</button><button class="invisible" data-model="bind:setVisible, sel" data-importevent="listen: touchend, selectAll">Select all</button><button class="invisible" data-model="bind: setVisible, sel" data-importevent="listen: touchend, clearSelected">Clear selection</button></div><div class="importlist"><legend>Working deck</legend><ul data-current="foreach"><li name="current" data-current="bind: setType, type; bind: innerHTML, title; bind: setSelected, selected" data-importevent="listen: touchend, toggleSelect"></li></ul></div><div class="cancelmail" data-importevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-importevent="listen:touchstart, press; listen:touchend, upload" data-label="bind:innerHTML, savelbl">Save</div></div>';
                
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
                                },
                                setDirection: function(direction){
                                        (direction) ? node.classList.remove("invisible") : node.classList.add("invisible");
                                        (direction === "remove") ? this.innerHTML = "<<< Remove selection" : this.innerHTML = "Import selection >>>";           
                                },
                                setVisible : function(sel){
                                        (sel) ? this.classList.remove("invisible") : this.classList.add("invisible");
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
                            store, sel = model.get("sel") || 0;
                        
                        if (type === "current"){
                                store = currentDeck;
                                if (model.get("direction") !== "remove"){
                                        importCard.clearSelection("selected");
                                        model.set("direction", "remove"); 
                                        sel = 0;
                                }               
                        }
                        else{
                                store = selectedDeck;
                                if (model.get("direction") !== "add"){
                                        importCard.clearSelection("current");
                                        model.set("direction", "add"); 
                                        sel = 0;
                                }
                        }
                        
                        if (store.get(id).selected) {
                                store.update(id, "selected", false);
                                model.set("sel", sel-1);
                        }
                        else{
                                store.update(id, "selected", true);
                                model.set("sel", sel+1);
                        }
                };
                
                importCard.selectAll = function(event, node){
                        var store;
                        (model.get("direction") === "add") ? store = selectedDeck : store = currentDeck;
                        store.loop(function(v,i){
                                store.update(i, "selected", true);
                        });
                };
                
                importCard.clearSelected = function(event, node){
                        var store;
                        (model.get("direction") === "add") ? store = selectedDeck : store = currentDeck;
                        store.loop(function(v,i){
                                store.update(i, "selected", false);
                        });        
                };
                
                importCard.addRemoveSelected = function(event, node){
                        var dir = model.get("direction");
                        (dir === "add") ? importCard.addSelected() : importCard.removeSelected(); 
                };
                
                importCard.addSelected = function addSelected(){
                        
                };
                
                importCard.removeSelected = function removeSelected(){
                        
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
                            promise = new Promise(),
                            el = importCard.dom.querySelector("ul[name='selected']"),
                            spinner = new Spinner().spin(el);
                            
                        cdb.setTransport(transport);
                        
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
                                spinner.stop();
                                store.reset(arr);
                                promise.fulfill();        
                        });
                        
                        return promise;
                };
                
                importCard.reset = function reset($deckId){
                        model.reset({});
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