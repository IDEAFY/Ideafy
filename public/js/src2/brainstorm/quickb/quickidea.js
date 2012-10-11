define("Ideafy/Brainstorm/QuickIdea", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Model, Event, Config){
                
                return function QuickIdeaConstructor($session, $prev, $next){
                        
                        // Declaration
                        var _widget = new Widget(),
                             _labels = Config.get("labels");
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "quickidea" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickidea"><div class="previousbutton" data-quickideaevent="listen: touchstart, press; listen: click, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickidea"></div></div>';
                        
                        _widget.alive(Map.get("quickidea"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                node.classList.remove("pressed");
                                $next("quickidea");
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickidea");
                        };
                        
                        // Return
                        return _widget;
                };     
        });
