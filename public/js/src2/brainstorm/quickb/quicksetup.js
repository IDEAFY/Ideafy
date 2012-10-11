define("Ideafy/Brainstorm/QuickSetup", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config"],
        function(Widget, Map, Model, Config){
                
                return function QuickSetupConstructor($session, $prev, $next){
                        
                        // Declaration
                        var _widget = new Widget(),
                             _labels = Config.get("labels");
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels)
                        });
                        
                        _widget.template = '<div id = "quicksetup"><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quicksetup"></div></div>';
                        
                        _widget.alive(Map.get("quicksetup"));
                        
                        // Return
                        return _widget;
                };     
        });
