/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Library/DeckList", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", 'Olives/Event-plugin', 'CouchDBStore', "Promise", "Ideafy/Utils"],
        function(Widget, Map, Config, Model, Event, CouchDBStore, Promise, Utils){
                
                return function DeckListConstructor($type){
                        
                        var deckList = new Widget(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            decks = new CouchDBStore([]);
                        
                        decks.setTransport(Config.get("transport"));
                        
                        deckList.plugins.addAll({
                                "labels" : new Model(labels),
                                "active" : new Model(user, {
                                        
                                }),
                                "decks" : new Model(decks, {
                                        setVersion : function(version){
                                                (version)?this.innerHTML=labels.get("version")+version: this.innerHTML="";        
                                        },
                                        setAuthor: function(author){
                                                console.log(author);
                                                if (author === "Taïaut"){
                                                        this.innerHTML = "";
                                                        this.setAttribute("style", "background-image:url('../img/logo.png');")
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
                        
                        deckList.template = '<ul id="deck-list" data-decks="foreach"><li class="list-item" data-decklistevent="listen:touchstart, setStart; listen:touchmove, showActionBar"><div class = "decklight"></div><div class="item-header"><h3 data-decks="bind:innerHTML, doc.title"></h3><span class="version" data-decks="bind:setVersion, doc.version"></span></div><div class="item-body"><p data-decks="bind:innerHTML,doc.description"></p></div><div class="item-footer"><label data-labels="bind:innerHTML, designedby"></label><div class="author" data-decks="bind:setAuthor, doc.author"></div><span class="date" data-decks="bind:date, doc.date"></div></div></li></ul>';
                        
                        deckList.reset = function reset(){       
                        };
                        
                        deckList.getModel = function getModel(){
                                return decks;        
                        };
                        
                        deckList.getDecks = function getDecks(type, onEnd){
                                decks.sync(Config.get("db"), {keys : user.get(type)}).then(function(){
                                        onEnd("ok");
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
                                deckList.getDecks($type, onEnd);
                                
                        };
                        
                        DL = deckList;
                        return deckList;
                        
                };
        });