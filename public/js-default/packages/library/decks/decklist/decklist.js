/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../../libs/olives"),
      emily = require("../../../../libs/emily"),
      CouchDBTools = require("../../../../libs/CouchDBTools"),
      Widget = olives.OObject,
      Map = require("../../../../services/map"),
      Config = require("../../../../services/config"),
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Store = emily.Store,
      CouchDBBulkDocuments = CouchDBTools.CouchDBBulkDocuments,
      Promise = emily.Promise,
      Utils = require("../../../../services/utils"),
      ActionBar = require("../../../../services/actionbar");

module.exports = function DeckListConstructor($type){
                        
                        var deckList = new Widget(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            decks = new Store([]),
                            currentBar = null;
                        
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
                                                        this.setAttribute("style", "background-image:url('img/logo.png');");
                                                }
                                                else {
                                                        this.innerHTML = author; //need to make sure that author field is filled with username and userid needs to be saved along somewhere with the deck document
                                                }    
                                        },
                                        date : function(date){
                                                (date) ? this.innerHTML = Utils.formatDate(date) : this.innerHTML="";
                                        }
                                }),
                                "decklistevent" : new Event(deckList)
                        });
                        
                        deckList.template = '<ul id="deck-list" data-decks="foreach"><li class="list-item" data-decklistevent="listen:mousedown, setStart; listen:dblclick, showActionBar"><div class = "decklight"></div><div class="item-header"><h3 data-decks="bind:innerHTML, title"></h3><span class="version" data-decks="bind:setVersion, version"></span></div><div class="item-body"><p data-decks="bind:innerHTML,description"></p></div><div class="item-footer"><label data-labels="bind:innerHTML, designedby"></label><div class="author" data-decks="bind:setAuthor, author"></div><span class="date" data-decks="bind:date, date"></div></div></li></ul>';
                        
                        deckList.setStart = function(event, node){
                                currentBar && currentBar.hide(); // hide previous action bar
                        };
                        
                        deckList.showActionBar = function(event, node){
                                var id = node.getAttribute("data-decks_id"),
                                    display = false, frag;
                                    
                                // check if actionbar exists for this element
                                if (currentBar && currentBar.getParent() === node){
                                        display = true;
                                }
                                    
                                if (!display){
                                        currentBar = new ActionBar("deck", node, decks.get(id)._id);
                                        frag = document.createDocumentFragment();  
                                
                                        currentBar.place(frag); // render action bar    
                                        node.appendChild(frag); // display action bar
                                        display = true; // prevent from showing it multiple times
                                }
                        };
                        
                        deckList.reset = function reset(onEnd){
                                var callback = onEnd || null;
                                decks.reset([]);
                                deckList.getDecks($type, callback);
                                display = false;             
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
                                var dom = deckList.dom, node, position;
                                
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
                                        node = dom.querySelector(".list-item[data-decks_id='"+position+"']");
                                }
                                init(node);
                                node.classList.add("selected");
                                node.scrollIntoView();
                                return position;
                        };
                        
                        deckList.init = function init(onEnd){
                                deckList.reset(onEnd);
                        };
                        
                        // also watch for change of language
                        user.watchValue("lang", function(){
                                // check selected deck
                                deckList.getDecks($type);         
                        });
                        
                        
                        return deckList;
                        
                };
