define("Ideafy/Library/DeckDetails", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "Ideafy/Avatar", "Ideafy/Utils"],
        function(Widget, Config, Model, Event, Store, Avatar, Utils){
                
                return function DeckDetailsConstructor(){
                 
                        var deckDetails = new Widget(),
                            deckModel = new Store(),
                            labels = Config.get("labels");
                        
                        deckDetails.plugins.addAll({
                                "labels": new Model(labels),
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
                        
                        deckDetails.template = '<div class="deckdetails"><div class="deckinfo"><div class="deckheader"><div class="decklogo" data-deckdetails="bind: setPic, author"></div><p><h2 data-deckdetails="bind:innerHTML, title"></h2><span data-labels="bind:innerHTML, designedby"></span><span data-deckdetails="bind: innerHTML, created_by"></span></p><span class="date" ></span></div><p class="deckdescription" data-deckdetails="bind: innerHTML, description"></p></div><div class="deckcarousel"></div></div>';
                        
                        deckDetails.reset = function reset(deck){
                                var lang = Config.get("user").get("lang");
                                // check deck default language -- if it does not match user language look for a translation
                                if (!deck.default_lang || (deck.default_lang === lang)) {
                                        deckModel.reset(deck);
                                }
                                else {
                                        (deck.translations && deck.translations[lang]) ? deckModel.reset(deck.translations[lang]) : deckModel.reset(deck);
                                }        
                        };
                        
                        DD= deckDetails;
                        
                        return deckDetails;
                };
        });
