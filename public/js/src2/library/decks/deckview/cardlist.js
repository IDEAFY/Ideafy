define ("Ideafy/Library/CardList", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "Store"],
        function(Widget, Config, Model, Event, CouchDBStore, Store){
                
                return function CardListConstructor($cardType){
                        
                
                        var cardList = new Widget(),
                            cards = new Store([]);
                        
                        cardList.plugins.addAll({
                                "cards": new Model(cards, {
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
                        
                        cardList.template = '<div class="cardlist"><div class="cardpage"><ul data-cards="foreach"><li class="card"><div class="cardpicture" data-cards="bind:setPic,picture_file"></div><div class="cardtitle" data-cards="bind: formatTitle, title"></div></li></ul></div></div>';
                        
                        cardList.reset = function reset(deck){
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
                                        cdb.unsync();
                                });
                        };
                        
                        return cardList;
                        
                };  
        });
