define("Ideafy/Library/Menu", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config"],
        function(Widget, Map, Model, Config){
                
                return function LibraryMenuConstructor(){
                        
                        // declaration
                        var _menu = new Widget(),
                            _dom = Map.get("library-menu");
                        
                        // setup
                        _menu.plugins.addAll({
                                "label" : new Model(Config.get("labels"))
                        });
                        
                        _menu.show = function show(){
                                _dom.setAttribute("style", "display : block;");        
                        };
                        
                        _menu.hide = function hide(){
                                _dom.setAttribute("style", "display : none;");        
                        };
                        
                        _menu.alive(_dom);
                        
                        // return
                        
                       return _menu;
                        
                        
                }
                
        })
