define("Ideafy/Brainstorm/QuickTech", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config"],
        function(Widget, Map, Model, Config){
                
                return function QuickTechConstructor($session, $prev, $next){
                        
                        // Declaration
                        var _widget = new Widget(),
                             _labels = Config.get("labels");
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels)
                        });
                        
                        _widget.template = '<div id = "quicktech"><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quicktech"></div></div>';
                        
                        _widget.alive(Map.get("quicktech"));
                        
                        // Return
                        return _widget;
                };     
        });
