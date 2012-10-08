define("Ideafy/Brainstorm/Menu", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config"],
        function(Widget, Map, Model, Config){
                
                return function BrainstormMenuConstructor(){
                        
                        // declaration
                        var _menu = new Widget(),
                            _dom = Map.get("brainstorm-menu");
                        
                        // setup
                        _menu.plugins.addAll({
                                "label" : new Model(Config.get("labels"))
                        });
                        _menu.alive(_dom);
                        
                        // return
                        
                       return _menu;
                        
                        
                }
                
        })
