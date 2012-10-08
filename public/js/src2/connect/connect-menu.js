define("Ideafy/Connect/Menu", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config"],
        function(Widget, Map, Model, Config){
                
                return function ConnectMenuConstructor(){
                        
                        // declaration
                        var _menu = new Widget(),
                            _dom = Map.get("connect-menu");
                        
                        // setup
                        _menu.plugins.addAll({
                                "label" : new Model(Config.get("labels"))
                        });
                        _menu.alive(_dom);
                        
                        // return
                        
                       return _menu;
                        
                        
                }
                
        })
