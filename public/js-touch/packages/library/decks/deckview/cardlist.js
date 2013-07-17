/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define (["OObject", "service/config", "Bind.plugin", "Event.plugin", "CouchDBBulkDocuments", "CouchDBDocument", "Store", "service/cardpopup", "Promise"],
        function(Widget, Config, Model, Event, CouchDBBulkDocuments, CouchDBDocument, Store, CardPopup, Promise){
                
                return function CardListConstructor($cardType, $editCard, $update){
                        
                
                        var cardList = new Widget(),
                            cards = new Store([]),
                            cardPage = new Store([]),
                            pagination = new Store({currentPage:0, nbPages: 0}),
                            touchStart,
                            popupUI,
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            currentDeck = null,
                            currentHighlight = null; // used to keep track of current zoom
                        
                        cardList.plugins.addAll({
                                "pagination" : new Model(pagination,{
                                        setPage : function(currentPage){
                                                var nb = currentPage+1;
                                                if (pagination.get("nbPages") > 1){
                                                        this.innerHTML = labels.get("page") + nb + " / " + pagination.get("nbPages");        
                                                }
                                                else this.innerHTML = "";
                                        },
                                        setLeft : function(currentPage){
                                                (currentPage > 0)? this.classList.remove("invisible"):this.classList.add("invisible");        
                                        },
                                        setRight : function(currentPage){
                                                (currentPage < pagination.get("nbPages")-1)? this.classList.remove("invisible"):this.classList.add("invisible");         
                                        }
                                }),
                                "cards": new Model(cardPage, {
                                        formatTitle : function(title){
                                                if (title){
                                                        this.classList.remove("newcard");
                                                        if ($cardType !== "techno") {
                                                                this.innerHTML = title.substring(0,1).toUpperCase()+title.substring(1).toLowerCase(); 
                                                        }
                                                        else{
                                                                this.innerHTML = title.toUpperCase();
                                                                this.setAttribute("style", "font-family:Helvetica;");
                                                        }
                                               }
                                               else{
                                                       this.classList.add("newcard");
                                               }
                                        },
                                        setPic : function(pic){
                                                var json, node=this;
                                                if (pic && pic.search("img/decks/") > -1){
                                                        this.setAttribute("style", "background-image:url('"+pic+"');");
                                                }
                                                else if (pic){
                                                        json = {"dir":"cards", "filename":pic};
                                                        Config.get("transport").request("GetFile", json, function(data){
                                                                node.setAttribute("style", "background:white; background-image: url('"+data+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;");   
                                                        });
                                                }
                                                else {
                                                        switch($cardType){
                                                                case "characters":
                                                                        this.classList.add("newchar");
                                                                        break;
                                                                case "contexts":
                                                                        this.classList.add("newctx");
                                                                        break;
                                                                case "problems":
                                                                        this.classList.add("newpb");
                                                                        break;
                                                                case "techno":
                                                                        this.classList.add("newtech");
                                                                        break;
                                                                default:
                                                                        this.setAttribute("style", "background-image: none;");        
                                                        }
                                                }
                                        }
                                }),
                                "cardlistevent": new Event(cardList)
                        });
                        
                        cardList.template = '<div class="cardlist"><div id="cardlist-popup" class="invisible"></div><div class="cardpage" data-cardlistevent="listen:touchstart, setStart; listen:touchmove, changePage"><div class="pagenb"><div class="leftcaret" data-pagination="bind: setLeft, currentPage" data-cardlistevent="listen:touchstart, push; listen:touchend, previousPage"></div><span data-pagination="bind: setPage, currentPage"></span><div class = "rightcaret" data-pagination="bind: setRight, currentPage" data-cardlistevent="listen:touchstart, push; listen:touchend, nextPage"></div></div><ul data-cards="foreach"><li class="card" data-cardlistevent="listen:touchstart, highlight; listen:touchend, zoom"><div class="cardpicture" data-cards="bind:setPic,picture_file"></div><div class="cardtitle" data-cards="bind: formatTitle, title"></div><div class="cardbtnbar invisible"><div class="editcardbtn" data-cardlistevent="listen: touchstart, press; listen:touchend, editCard"></div><div class="deletecardbtn " data-cardlistevent="listen: touchstart, press; listen:touchend, deleteCard"></div></div></li></ul></div></div>';
                        
                        cardList.reset = function reset(deck){
                                //reset highlight
                                currentHighlight = null;
                                currentDeck = deck._id;
                                cardList.getCardList(deck.content[$cardType]); // just do a one time fetch of the cards (as opposed to remaining sync'd)       
                        };
                        
                        cardList.getCardList = function getCardList(idlist){
                                var cdb = new CouchDBBulkDocuments(), query = idlist;
                                if (idlist[0] === "newcard"){
                                        query = idlist.slice(1, idlist.length);
                                }
                                if (query.length){
                                        cdb.setTransport(Config.get("transport"));
                                        cdb.sync(Config.get("db"), {keys:query}).then(function(){
                                                (idlist[0] === "newcard") ? cards.reset([{_id:"newcard", title:"", picture_file:""}]) : cards.reset([]);
                                                cdb.loop(function(v,i){
                                                        cards.alter("push", v.doc);        
                                                });
                                                // 12 cards max per page
                                                pagination.set("nbPages", Math.ceil(cards.getNbItems()/12)); 
                                        
                                                // display first page
                                                cardList.displayPage(0);
                                                cdb.unsync();
                                        });
                                }
                                else{
                                        cards.reset([{_id:"newcard", title:"", picture_file:""}]);
                                        pagination.set("nbPages", 1); 
                                        cardList.displayPage(0);       
                                }
                        };
                        
                        cardList.displayPage = function displayPage(pageNB){
                                var i, length = cards.getNbItems() - 12 * pageNB; 
                                
                                //set page number
                                pagination.set("currentPage", pageNB);
                                
                                // build page content
                                cardPage.reset([]);
                                for (i = 0; i< length; i++){
                                        cardPage.alter("push", cards.get(pageNB*12+i));        
                                }
                        };
                        
                        cardList.removeCard = function removeCard(cardId){
                                var deckCDB = new CouchDBDocument(),
                                    cardCDB = new CouchDBDocument();
                                // start by removing the card from the current deck
                                deckCDB.setTransport(Config.get("transport"));
                                cardCDB.setTransport(Config.get("transport"));
                                deckCDB.sync(Config.get("db"), currentDeck)
                                .then(function(){
                                        var content = deckCDB.get("content"),
                                            arr = content[$cardType];
                                        
                                        arr.splice(arr.indexOf(cardId), 1);
                                        content[$cardType] = arr;
                                        deckCDB.set("content", content);
                                        return deckCDB.upload();
                                })
                                .then(function(){
                                        // refresh card list
                                        // currentHighlight = null;
                                        // cardList.getCardList(deckCDB.get("content")[$cardType]);
                                        $update("updated", currentDeck, $cardType);
                                        deckCDB.unsync();
                                        
                                        // now process card update
                                        return cardCDB.sync(Config.get("db"), cardId);
                                })
                                .then(function(){
                                        var decks = cardCDB.get("deck"),
                                            promise = new Promise(),
                                            json, file = cardCDB.get("picture_file");
                                        
                                        decks.splice(currentDeck, 1);
                                        
                                        // if there are other decks this card belongs to simply udated it and finish removal
                                        if (decks.length){
                                                cardCDB.set("deck", decks);
                                                cardCDB.upload()
                                                .then(function(){
                                                        promise.fulfill();
                                                })
                                        }
                                        else{
                                                if (file.search("img/decks") === -1){
                                                        json = {type: "card", file: file}
                                                        Config.get("transport").request("DeleteAttachment", json, function(result){
                                                                if (result !== "ok"){
                                                                        console.log(result);
                                                                }
                                                        });
                                                }
                                                cardCDB.remove()
                                                .then(function(){
                                                        promise.fulfill();
                                                });
                                        }
                                        return promise;
                                })
                                .then(function(){
                                        console.log("card removal operation completed");
                                });
                                        
                        };
                        
                        cardList.push = function(event, node){
                                node.classList.add("invisible");        
                        };
                        
                        cardList.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        cardList.previousPage = function(event, node){
                                cardList.displayPrevious();        
                        };
                        
                        cardList.nextPage = function(event, node){
                                cardList.displayNext();
                        };
                        
                        cardList.displayPrevious = function displayPrevious(){
                                var nb = pagination.get("currentPage");
                                if (nb>0) {
                                        cardList.displayPage(nb-1);
                                        pagination.set("currentPage", nb-1); 
                                }      
                        };
                        
                        cardList.displayNext = function displayNext(){
                                var nb = pagination.get("currentPage");
                                if (nb<(pagination.get("nbPages")-1)) {
                                        cardList.displayPage(nb+1);
                                        pagination.set("currentPage", nb-1); 
                                } 
                        };
                        
                        cardList.setStart = function(event, node){
                                touchStart = [event.pageX, event.pageY];
                        };
                
                        cardList.changePage = function(event, node){
                                touchPoint = [event.pageX, event.pageY];
                                
                                if ((touchStart[0]-touchPoint[0]) > 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                        cardList.displayNext();
                                }
                                else if ((touchStart[0]-touchPoint[0]) < 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                        cardList.displayPrevious();
                                }
                        };
                        
                        cardList.highlight = function(event, node){
                                if (currentHighlight !== null) document.querySelector("li[data-cards_id='"+currentHighlight+"']").classList.remove("highlighted");
                                currentHighlight = node.getAttribute("data-cards_id");
                                node.classList.add("highlighted");       
                        };
                        
                        cardList.zoom = function(event, node){
                                var id = parseInt(node.getAttribute("data-cards_id"), 10) + 12*pagination.get("currentPage");
                                if (cards.get(id)._id === "newcard"){
                                        $editCard("newcard", $cardType);
                                }
                                else{
                                        cardList.setPopup(id);
                                        if (cards.get(id).created_by === user.get("_id")){
                                                // add edit & delete button on card
                                                node.querySelector(".cardbtnbar").classList.remove("invisible");
                                        }
                                }       
                        };
                        
                        cardList.editCard = function editCard(event, node){
                                var id = parseInt(node.getAttribute("data-cards_id"), 10) + 12*pagination.get("currentPage");
                                event.stopPropagation();
                                // close popup
                                popupUI.close();
                                // hide buttons
                                node.parentNode.classList.add("invisible");
                                // display edit screen
                                $editCard(cards.get(id)._id, $cardType);     
                        };
                        
                        cardList.deleteCard = function deleteCard(event, node){
                                var id = parseInt(node.getAttribute("data-cards_id"), 10) + 12*pagination.get("currentPage");
                                // delete card from deck -- if the card does not belong to anymore deck - remove from database
                                event.stopPropagation();
                                // close popup
                                popupUI.close();
                                // hide buttons
                                node.parentNode.classList.add("invisible");
                                // display confirmation popup
                                cardList.removeCard(cards.get(id)._id);      
                        };
                        
                        // Method called to initialize a card popup
                        cardList.setPopup = function setPopup(id){
                                var pos = {x:0, y:0}, // the position of the popup
                                    caret = ""; // the position of the caret
                                
                                id = id%12;
                                // determine popup position and caret orientation based on id
                                switch(id){
                                        case 1:
                                                pos.x = 304;
                                                pos.y = 157;
                                                caret = "left"
                                                break;
                                        case 2:
                                                pos.x = 23;
                                                pos.y = 157;
                                                caret = "right";
                                                break;
                                        case 3:
                                                pos.x = 170;
                                                pos.y = 157;
                                                caret = "right";
                                                break;
                                        case 4:
                                                pos.x = 157;
                                                pos.y = 339;
                                                caret = "left";
                                                break;
                                        case 5:
                                                pos.x = 304;
                                                pos.y = 339;
                                                caret = "left";
                                                break;
                                        case 6:
                                                pos.x = 23;
                                                pos.y = 339;
                                                caret = "right";
                                                break;
                                        case 7:
                                                pos.x = 170;
                                                pos.y = 339;
                                                caret = "right";
                                                break;
                                        case 8:
                                                pos.x = 157;
                                                pos.y = 350;
                                                caret = "left";
                                                break;
                                        case 9:
                                                pos.x = 304;
                                                pos.y = 350;
                                                caret = "left";
                                                break;
                                        case 10:
                                                pos.x = 23;
                                                pos.y = 350;
                                                caret = "right";
                                                break;
                                        case 11:
                                                pos.x = 170;
                                                pos.y = 350;
                                                caret = "right";
                                                break;
                                        default:
                                                pos.x = 157;
                                                pos.y = 157;
                                                caret = "left"
                                                break;
                                        
                                }
                                
                                popupUI.reset(cards.get(id), pos, caret, document.getElementById("cardlist-popup"));      
                        };
                        
                        // Method called when closing a popup -- passed as a parameter to the popup constructor
                        cardList.closePopup = function closePopup(){
                                cardList.dom.querySelector("li[data-cards_id='"+currentHighlight+"']").classList.remove("highlighted");
                                cardList.dom.querySelector("li[data-cards_id='"+currentHighlight+"']").querySelector(".cardbtnbar").classList.add("invisible");
                                currentHighlight = null;   
                        };
                        
                        // init popup UI
                        popupUI = new CardPopup(cardList.closePopup);
                        
                        return cardList;
                        
                };  
        });
