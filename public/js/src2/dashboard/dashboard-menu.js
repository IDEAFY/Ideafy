define("Ideafy/Dashboard/Menu", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config"],
        function(Widget, Map, Model, Config){
                
                return function DashboardMenuConstructor(){
                        
                        // declaration
                        var _menu = new Widget(),
                            _dom = Map.get("dashboard-menu");
                        
                        // setup
                        _menu.plugins.addAll({
                                "label" : new Model(Config.get("labels"))
                        });
                        _menu.alive(_dom);
                        
                        // return
                        
                       return _menu;
                        
                        
                }
                
        })
