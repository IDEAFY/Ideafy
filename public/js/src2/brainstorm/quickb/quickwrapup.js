define("Ideafy/Brainstorm/QuickWrapup", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config"],
        function(Widget, Map, Model, Config){
                
                return function QuickWrapupConstructor($session, $prev, $next){
                        
                        // Declaration
                        var _widget = new Widget(),
                             _labels = Config.get("labels");
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels)
                        });
                        
                        _widget.template = '<div id = "quickwrapup"><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickwrapup"></div></div>';
                        
                        _widget.alive(Map.get("quickwrapup"));
                        
                        // Return
                        return _widget;
                };     
        });
