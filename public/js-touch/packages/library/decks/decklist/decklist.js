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
                                                if (author === "Taïaut"){
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
                                deckList.getDecks($type, onEnd);              
                        };
                        
                        deckList.getModel = function getModel(){
                                return decks;        
                        };
                        
                        deckList.getDecks = function getDecks(type, onEnd){
                                var cdb = new CouchDBBulkDocuments();
                                cdb.setTransport(Config.get("transport"));
                                cdb.sync(Config.get("db"), {keys : user.get(type)}).then(function(){
                                        var lang = user.get("lang");
                                        decks.reset([]);
                                        cdb.loop(function(v, i){
                                                if (!v.doc.default_lang || (v.doc.default_lang === lang)) {
                                                        decks.alter("push", v.doc);
                                                }
                                                 else {
                                                        (v.doc.translations && v.doc.translations[lang]) ? decks.alter("push", v.doc.translations[lang]) : decks.alter("push", v.doc);
                                                }                
                                        });
                                        if (onEnd) {onEnd("ok");}
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
                        
                        deckList.init = function init(onEnd){
                                deckList.reset(onEnd);
                        };
                        
                        
                        // watch for changes for this particular type of decks in user doc 
                        user.watchValue($type, function(){
                                deckList.getDecks($type);        
                        });
                        
                        // also watch for change of language
                        user.watchValue("lang", function(){
                                // check selected deck
                                deckList.getDecks($type);         
                        });
                        
                        
                        return deckList;
                        
                };
        });