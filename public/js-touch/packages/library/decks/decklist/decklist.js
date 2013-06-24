/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "service/config", "Bind.plugin", 'Event.plugin', 'Store', 'CouchDBBulkDocuments', "Promise", "service/utils"],
        function(Widget, Map, Config, Model, Event, Store, CouchDBBulkDocuments, Promise, Utils){
                
                return function DeckListConstructor($type){
                        
                        var deckList = new Widget(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            decks = new Store([]);
                        
                        deckList.plugins.addAll({
                                "labels" : new Model(labels),
                                "active" : new Model(user, {
                                        
                                }),
                                "decks" : new Model(decks, {
                                        setVersion : function(version){
                                                (version)?this.innerHTML=labels.get("version")+version: this.innerHTML="";        
                                        },
                                        setAuthor: function(author){
                                                if (author === "Taiaut"){
                                                        this.innerHTML = "";
                                                        this.setAttribute("style", "background-image:url('img/logo.png');")
                                                }
                                                else {
                                                        this.innerHTML = author; //need to make sure that author field is filled with username and userid needs to be saved along somewhere with the deck document
                                                }    
                                        },
                                        date : function(date){
                                                (date) ? this.innerHTML = Utils.formatDate(date) : this.innerHTML="";
                                        }
                                }),
                                "decksevent" : new Event(deckList)
                        });
                        
                        deckList.template = '<ul id="deck-list" data-decks="foreach"><li class="list-item" data-decklistevent="listen:touchstart, setStart; listen:touchmove, showActionBar"><div class = "decklight"></div><div class="item-header"><h3 data-decks="bind:innerHTML, title"></h3><span class="version" data-decks="bind:setVersion, version"></span></div><div class="item-body"><p data-decks="bind:innerHTML,description"></p></div><div class="item-footer"><label data-labels="bind:innerHTML, designedby"></label><div class="author" data-decks="bind:setAuthor, author"></div><span class="date" data-decks="bind:date, date"></div></div></li></ul>';
                        
                        deckList.reset = function reset(onEnd){
                                var callback = onEnd || null;
                                decks.reset([]);
                                deckList.getDecks($type, callback);              
                        };
                        
                        deckList.getModel = function getModel(){
                                return decks;        
                        };
                        
                        deckList.getDecks = function getDecks(type, onEnd){
                                var cdb = new CouchDBBulkDocuments(), keys = [];
                                switch(type){
                                        // default gets all decks this user has acces to
                                        default:
                                                keys = user.get("taiaut_decks").concat(user.get("custom_decks"));
                                                break;
                                                
                                }
                                cdb.setTransport(Config.get("transport"));
                                cdb.sync(Config.get("db"), {keys : keys}).then(function(){
                                        var lang = user.get("lang"), arr = [];
                                        cdb.loop(function(v, i){
                                                if (!v.doc.default_lang || (v.doc.default_lang === lang)) {
                                                        arr.push(v.doc);
                                                }
                                                 else {
                                                        (v.doc.translations && v.doc.translations[lang]) ? arr.push(v.doc.translations[lang]) : arr.push(v.doc);
                                                }                
                                        });
                                        arr.sort(function(x,y){
                                                var a = x.title, b = y.title;
                                                if (a<b) return -1;
                                                if (a>b) return 1;
                                                if (a===b) return 0;
                                                });
                                        decks.reset(arr);
                                        onEnd && onEnd("ok");
                                        cdb.unsync();
                                });             
                        };
                        
                        // initialize selection (could be first item or active item)
                        deckList.initSelected = function initSelected(init, id){
                                var dom = deckList.dom,
                                    node = dom.querySelector(".list-item[data-decks_id='"+id+"']");
                                init(node);
                                node.classList.add("selected");      
                        };
                        
                        deckList.highlightDeck = function highlightDeck(init, deckId){
                                var dom = deckList.dom,
                                    currentEl = dom.querySelector(".list-item.selected"), node, position;
                                
                                if (deckId === 0){
                                        node = dom.querySelector(".list-item[data-decks_id='0']");
                                        position = 0;
                                }
                                
                                else{
                                        // check position of deck in the list
                                        decks.loop(function(v,i){
                                                if (v._id === deckId){
                                                        position = i;
                                                }        
                                        });
                                        currentEl.classList.remove("selected");
                                        node = dom.querySelector(".list-item[data-decks_id='"+position+"']");
                                        console.log(position, node);
                                }
                                init(node);
                                node.classList.add("selected");
                                return position;
                        };
                        
                        deckList.init = function init(onEnd){
                                deckList.reset(onEnd);
                        };
                        
                        /* -- MOVED TO DECKS.JS
                        // watch for changes for this particular type of decks in user doc 
                        user.watchValue("custom_decks", function(){
                                if ($type === "custom_decks" || $type === "all_decks"){
                                        deckList.getDecks($type);
                                }
                        });
                        
                        user.watchValue("taiaut_decks", function(){
                                if ($type === "taiaut_decks" || $type === "all_decks"){
                                        deckList.getDecks($type);
                                }        
                        });
                        */
                        
                        // also watch for change of language
                        user.watchValue("lang", function(){
                                // check selected deck
                                deckList.getDecks($type);         
                        });
                        
                        
                        return deckList;
                        
                };
        });