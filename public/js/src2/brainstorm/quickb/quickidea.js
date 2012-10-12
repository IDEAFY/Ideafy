define("Ideafy/Brainstorm/QuickIdea", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Model, Event, Config){
                
                return function QuickIdeaConstructor($session, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                             _labels = Config.get("labels");
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "quickideaevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickidea"><div class="previousbutton" data-quickideaevent="listen: touchstart, press; listen: click, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickidea" data-quickideaevent="listen:click, toggleProgress"></div><div id="quickidea-left" class="leftarea"></div><div id="quickidea-right" class="workarea"><div class="whiteboard"></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickideaevent="listen: touchstart, press; listen:click, next"></div></div></div>';
                        
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
                        
                        _widget.toggleProgress = function(event, node){
                                $progress(node);               
                        };
                        
                        // Return
                        return _widget;
                };     
        });
