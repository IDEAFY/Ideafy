define("Ideafy/Brainstorm/QuickScenario", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Model, Event, Config){
                
                return function QuickScenarioConstructor($session, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                             _labels = Config.get("labels");
                        
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "quickscenarioevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickscenario"><div class="previousbutton" data-quickscenarioevent="listen: touchstart, press; listen: click, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickscenario" data-quickscenarioevent="listen:click, toggleProgress"></div><div id="quickscenario-left" class="leftarea"></div><div id="quickscenario-right" class="workarea"><div class="whiteboard"></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickscenarioevent="listen: touchstart, press; listen:click, next"></div></div></div>';
                        
                        _widget.alive(Map.get("quickscenario"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                node.classList.remove("pressed");
                                $next("quickscenario");
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickscenario");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress(node);               
                        };
                        
                        // Return
                        return _widget;
                };     
        });
