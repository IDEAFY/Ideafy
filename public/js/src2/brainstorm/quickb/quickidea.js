define("Ideafy/Brainstorm/QuickIdea", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config"],
        function(Widget, Map, Model, Config){
                
                return function QuickIdeaConstructor($session, $prev, $next){
                        
                        // Declaration
                        var _widget = new Widget(),
                             _labels = Config.get("labels");
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels)
                        });
                        
                        _widget.template = '<div id = "quickidea"><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickidea"></div></div>';
                        
                        _widget.alive(Map.get("quickidea"));
                        
                        // Return
                        return _widget;
                };     
        });
