define("Ideafy/Brainstorm/QuickScenario", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config"],
        function(Widget, Map, Model, Config){
                
                return function QuickScenarioConstructor($session, $prev, $next){
                        
                        // Declaration
                        var _widget = new Widget(),
                             _labels = Config.get("labels");
                        
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels)
                        });
                        
                        _widget.template = '<div id = "quickscenario"><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickscenario"></div></div>';
                        
                        _widget.alive(Map.get("quickscenario"));
                        
                        // Return
                        return _widget;
                };     
        });
