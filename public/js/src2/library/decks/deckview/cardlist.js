define ("Ideafy/Library/CardList", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "Store", "Ideafy/CardPopup"],
        function(Widget, Config, Model, Event, CouchDBStore, Store, CardPopup){
                
                return function CardListConstructor($cardType){
                        
                
                        var cardList = new Widget(),
                            cards = new Store([]),
                            cardPage = new Store([]),
                            pagination = new Store({currentPage:0, nbPages: 0}),
                            touchStart,
                            popupUI,
                            labels = Config.get("labels"),
                            currentHighlight = null; // used to keep track of current zoom
                        
                        cardList.plugins.addAll({
                                "pagination" : new Model(pagination,{
                                        setPage : function(currentPage){
                                                var nb = currentPage+1;
                                                if (pagination.get("nbPages") > 1){
                                                        this.innerHTML = labels.get("page") + nb + " / " + pagination.get("nbPages");        
                                                }
                                                else this.innerHTML = "";
                                        }
                                }),
                                "cards": new Model(cardPage, {
                                        formatTitle : function(title){
                                                if (title){
                                                        if ($cardType !== "techno") {
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
                                "cardlistevent": new Event(cardList)
                        });
                        
                        cardList.template = '<div class="cardlist"><div id="cardlist-popup" class="invisible"></div><div class="cardpage" data-cardlistevent="listen:touchstart, setStart; listen:touchmove, changePage"><span class="pagenb" data-pagination="bind: setPage, currentPage"></span><ul data-cards="foreach"><li class="card" data-cardlistevent="listen:touchstart, highlight; listen:touchend, zoom"><div class="cardpicture" data-cards="bind:setPic,picture_file"></div><div class="cardtitle" data-cards="bind: formatTitle, title"></div></li></ul></div></div>';
                        
                        cardList.reset = function reset(deck){
                                //reset highlight
                                currentHighlight = null;
                                cardList.getCardList(deck.content[$cardType]); // just do a one time fetch of the cards (as opposed to reminaing sync'd)       
                        };
                        
                        cardList.getCardList = function getCardList(idlist){
                                var cdb = new CouchDBStore();
                                cdb.setTransport(Config.get("transport"));
                                
                                console.log(idlist);
                                cdb.sync(Config.get("db"), {keys:idlist}).then(function(){
                                        cards.reset([]);
                                        cdb.loop(function(v,i){
                                                cards.alter("push", v.doc);        
                                        });
                                        // 12 cards max per page
                                        pagination.set("nbPages", Math.ceil(cards.getNbItems()/12)); 
                                        
                                        // display first page
                                        cardList.displayPage(0);
                                        cdb.unsync();
                                });
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
                        
                        cardList.displayPrevious = function displayPrevious(){
                                var nb = pagination.get("currentPage");
                                if (nb>0) cardList.displayPage(nb-1)        
                        };
                        
                        cardList.displayNext = function displayNext(){
                                var nb = pagination.get("currentPage");
                                if (nb<(pagination.get("nbPages")-1)) cardList.displayPage(nb+1);        
                        };
                        
                        cardList.setStart = function(event, node){
                                touchStart = [event.pageX, event.pageY];
                        };
                
                        cardList.changePage = function(event, node){
                                touchPoint = [event.pageX, event.pageY];
                                
                                if ((touchStart[0]-touchPoint[0]) > 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                        console.log("displaynext");
                                        cardList.displayNext();
                                }
                                else if ((touchStart[0]-touchPoint[0]) < 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                        console.log("displayprev");
                                        cardList.displayPrevious();
                                }
                        };
                        
                        cardList.highlight = function(event, node){
                                if (currentHighlight !== null) document.querySelector("li[data-cards_id='"+currentHighlight+"']").classList.remove("highlighted");
                                currentHighlight = node.getAttribute("data-cards_id");
                                node.classList.add("highlighted");       
                        };
                        
                        cardList.zoom = function(event, node){
                                var id = node.getAttribute("data-cards_id");
                                cardList.setPopup(id);        
                        };
                        
                        // Method called to initialize a card popup
                        cardList.setPopup = function setPopup(id){
                                var pos = {x:0, y:0}, // the position of the popup
                                    caret = ""; // the position of the caret
                                
                                // determine popup position and caret orientation based on id
                                switch(id){
                                        case "1":
                                                pos.x = 304;
                                                pos.y = 157;
                                                caret = "left"
                                                break;
                                        case "2":
                                                pos.x = 23;
                                                pos.y = 157;
                                                caret = "right";
                                                break;
                                        case "3":
                                                pos.x = 170;
                                                pos.y = 157;
                                                caret = "right";
                                                break;
                                        case "4":
                                                pos.x = 157;
                                                pos.y = 339;
                                                caret = "left";
                                                break;
                                        case "5":
                                                pos.x = 304;
                                                pos.y = 339;
                                                caret = "left";
                                                break;
                                        case "6":
                                                pos.x = 23;
                                                pos.y = 339;
                                                caret = "right";
                                                break;
                                        case "7":
                                                pos.x = 170;
                                                pos.y = 339;
                                                caret = "right";
                                                break;
                                        case "8":
                                                pos.x = 157;
                                                pos.y = 350;
                                                caret = "left";
                                                break;
                                        case "9":
                                                pos.x = 304;
                                                pos.y = 350;
                                                caret = "left";
                                                break;
                                        case "10":
                                                pos.x = 23;
                                                pos.y = 350;
                                                caret = "right";
                                                break;
                                        case "11":
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
                                document.querySelector("li[data-cards_id='"+currentHighlight+"']").classList.remove("highlighted");
                                currentHighlight = null;    
                        };
                        
                        // init popup UI
                        popupUI = new CardPopup(cardList.closePopup);
                        
                        return cardList;
                        
                };  
        });
