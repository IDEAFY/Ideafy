define("Ideafy/Library/DeckView", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "Map"],
        function(Widget, Model, Event, Store, Map){
                
                return function DeckViewConstructor(){
                        
                        var deckView = new Widget(),
                            cardMenu = new Store([
                                    {name: "char", active: false},
                                    {name: "context", active: false},
                                    {name: "problem", active: false},
                                    {name: "tech", active: false},
                            ]);
                        
                        
                        deckView.plugins.addAll({
                                "cardmenu" : new Model(cardMenu, {
                                        setClass : function(name){
                                                this.classList.add(name);
                                        },
                                        setActive : function(active){
                                                console.log(active);
                                                (active)?this.classList.add("active"):this.classList.remove("active");
                                                console.log(this.classList);
                                        }
                                }),
                                "deckviewevent" : new Event(deckView)
                        });
                        
                        deckView.template = '<div><ul class="card-menu" data-cardmenu="foreach"><li data-cardmenu = "bind: setClass, name; bind:setActive, active" data-deckviewevent="listen: touchstart, viewCards"></li></li></ul></div>';
                        
                        deckView.viewCards = function(event, node){
                                var id = node.getAttribute("data-cardmenu_id");
                                
                                cardMenu.loop(function(v,i){
                                        (i === parseInt(id)) ? cardMenu.update(i, "active", true):cardMenu.update(i, "active", false);        
                                }); 
                                console.log(cardMenu.toJSON());   
                        };
                        
                        deckView.reset = function reset(){
                                
                        };
                        
                        deckView.init = function init(){
                                
                        };
                        
                        deckView.place(Map.get("deckview"));
                        
                        return deckView;
                        
                };
        });
