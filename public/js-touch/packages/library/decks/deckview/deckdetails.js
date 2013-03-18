/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "service/config", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "service/avatar", "service/utils", "CouchDBStore"],
        function(Widget, Config, Model, Event, Store, Avatar, Utils, CouchDBStore){
                
                return function DeckDetailsConstructor(){
                 
                        var deckDetails = new Widget(),
                            deckModel = new Store(),
                            range = new Store({"max": 0}),
                            deckCards = new Store([]),
                            allCards = new CouchDBStore(),
                            labels = Config.get("labels");
                        
                        
                        allCards.setTransport(Config.get("transport"));
                        
                        deckDetails.plugins.addAll({
                                "labels": new Model(labels),
                                "range": new Model(range, {
                                        setCursorWidth : function(max){
                                                //how to set attribute on slider (shadowDOM)        
                                        }
                                }),
                                "cards": new Model(deckCards,{
                                        setStyle : function(style){
                                                //used to hide cards when viewing beginning or end of list
                                                if (style && style === "null"){
                                                        this.classList.add("invisible");               
                                                }
                                                else {
                                                        this.classList.remove("invisible");
                                                }
                                        },
                                        formatTitle : function(title){
                                                var id, node = this;
                                                if (title){
                                                        id = node.getAttribute("data-cards_id");
                                                        if (deckCards.get(id).type && deckCards.get(id).type !== 4) {
                                                                this.innerHTML = title.substring(0,1).toUpperCase()+title.substring(1).toLowerCase(); 
                                                        }
                                                        else{
                                                                this.innerHTML = title.toUpperCase();
                                                                this.setAttribute("style", "font-family:Helvetica;");
                                                        }
                                               }
                                        },
                                        setPic : function(pic){
                                                if (pic){
                                                        this.setAttribute("style", "background-image:url('"+pic+"');");
                                                }
                                                else {
                                                        this.setAttribute("style", "background-image: none;")
                                                }
                                        }
                                 }),
                                "deckdetails" : new Model(deckModel, {
                                        formatDate : function(date) {
                                                (date) ? this.innerHTML = Utils.formatDate(date) : this.innerHTML="";
                                        },
                                        setPic : function(author){
                                                var ui, frag, node=this;
                                                if (author === "Taiaut") {
                                                        this.setAttribute("style", "background-image:url('img/logo.png');");
                                                }
                                                else {
                                                        frag = document.createDocumentFragment();
                                                        ui = new Avatar([author]);
                                                        ui.place(frag);
                                                        (!node.hasChildNodes())?node.appendChild(frag):node.replaceChild(frag, node.firstChild);
                                                }
                                        }
                                }),
                                "carouselevent" : new Event(deckDetails)        
                        });
                        
                        deckDetails.template = '<div class="deckdetails"><div class="deckinfo"><div class="deckheader"><div class="decklogo" data-deckdetails="bind: setPic, author"></div><p><h2 data-deckdetails="bind:innerHTML, title"></h2><span data-labels="bind:innerHTML, designedby"></span><span data-deckdetails="bind: innerHTML, created_by"></span></p><span class="date" ></span></div><p class="deckdescription" data-deckdetails="bind: innerHTML, description"></p></div><div class="deckcarousel"><div class="innercarousel"></div><ul data-cards="foreach"><li data-cards="bind: setStyle,style"><div class="card"><div class="cardpicture" data-cards="bind:setPic,picture_file"></div><div class="cardtitle" data-cards="bind: formatTitle, title"></div></div></li></ul><input class="deckslider" type="range" value=0 min=0 data-range="bind: max, max; bind: setCursorWidth, max" data-carouselevent="listen: input, updateCards"></div></div>';
                        
                        deckDetails.displayCards = function displayCards(id){
                                var i, arr = [];
                                deckCards.reset([]);
                                for(i=0;i<5;i++){
                                        (allCards.get(id-2+i))?arr[i]=allCards.get(id-2+i).value : arr[i] = {style: "null"};
                                }
                                deckCards.reset(arr);
                        };
                        
                        deckDetails.updateCards = function(event, node){
                                deckDetails.displayCards(node.value);        
                        };
                        
                        deckDetails.reset = function reset(deck){
                                deckModel.reset(deck);
                                //reset card range
                                range.set("max", 0);
                                // get all cards.
                                allCards.unsync();
                                allCards.sync(Config.get("db"), "library", "_view/cards", {key: '"'+ deckModel.get("_id")+'"'}).then(function(){
                                        range.set("max", allCards.getNbItems()-1);
                                        // init card set with three cards
                                        deckDetails.displayCards(0);   
                                });
                        };
                        
                        return deckDetails;
                };
        });
