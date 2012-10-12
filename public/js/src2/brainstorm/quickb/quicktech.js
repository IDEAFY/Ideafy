define("Ideafy/Brainstorm/QuickTech", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Model, Event, Config){
                
                return function QuickTechConstructor($session, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                             _labels = Config.get("labels");
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "quicktechevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quicktech"><div class="previousbutton" data-quicktechevent="listen: touchstart, press; listen: click, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quicktech" data-quicktechevent="listen:click, toggleProgress"></div><div class="leftarea"></div><div class="drawarea"><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quicktechevent="listen: touchstart, press; listen:click, next"></div></div></div>';
                        
                        _widget.alive(Map.get("quicktech"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                node.classList.remove("pressed");
                                $next("quicktech");
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quicktech");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress(node);               
                        };
                        
                        // Return
                        return _widget;
                };     
        });
