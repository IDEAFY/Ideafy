define("Ideafy/Library/DeckList", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", 'Olives/Event-plugin', 'CouchDBStore', "Promise", "Ideafy/Utils"],
        function(Widget, Map, Config, Model, Event, CouchDBStore, Promise, Utils){
                
                return function DeckListConstructor($type){
                        
                        var deckList = new Widget(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            decks = new CouchDBStore([]);
                        
                        decks.setTransport(Config.get("transport"));
                        
                        deckList.plugins.addAll({
                                "active" : new Model(user, {
                                        
                                }),
                                "decks" : new Model(decks, {
                                        setVersion : function(version){
                                                (version)?this.innerHTML=labels.get("version")+version: this.innerHTML="";        
                                        },
                                        setAuthor: function(author){
                                                
                                        },
                                        date : function(date){
                                                (date) ? this.innerHTML = Utils.formatDate(date) : this.innerHTML="";
                                        }
                                }),
                                "decksevent" : new Event(deckList)
                        });
                        
                        deckList.template = '<ul id="decklist" data-decks="foreach"><li class="list-item" data-decklistevent="listen:touchstart, setStart; listen:touchmove, showActionBar"><div class = "decklight"></div><div class="item-header"><h3 data-decks="bind:innerHTML, doc.title"></h3><span class="version" data-decks="bind:setVersion, doc.version"></span></div><div class="item-body"><p data-decks="bind:innerHTML,doc.description"></p></div><div class="item-footer"><span class="author" data-decks="bind:setAuthor, author"></span><span class="date" data-decks="bind:date, doc.date"></div></div></li></ul>';
                        
                        deckList.reset = function reset(){       
                        };
                        
                        deckList.getDecks = function getDecks(type){
                                var promise = new Promise();
                                decks.sync(Config.get("db"), {keys : user.get(type)}).then(function(){
                                        console.log(decks.get(0));
                                        promise.resolve();
                                });
                                return promise;              
                        };
                        
                        deckList.init = function init(){
                                deckList.getDecks($type);
                                
                        };
                        
                        DL = deckList;
                        return deckList;
                        
                };
        });