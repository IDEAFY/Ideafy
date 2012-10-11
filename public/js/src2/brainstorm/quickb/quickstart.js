define("Ideafy/Brainstorm/QuickStart", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Model, Event, Config){
                
                return function QuickStartConstructor($session, $prev, $next){
                        
                        // declaration
                        var _widget = new Widget(),
                            _model = $session,
                             _labels = Config.get("labels");
                        
                        // setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "model" : new Model(_model),
                                "quickstartevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickstart"><div class="previousbutton" data-quickstartevent="listen: touchstart, press; listen: click, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickstart"></div><form class="quickstart-form"><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="quickstart-title" name="title" data-model="bind:value, title" data-labels="bind: placeholder, quickstarttitleplaceholder"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="quickstart-desc" name="description" data-model="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickstartevent="listen: touchstart, press; listen:click, next"></div></form><div>';
                        
                        _widget.alive(Map.get("quickstart"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                node.classList.remove("pressed");
                                $next("quickstart");
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickstart");
                        };
                        
                        // init
                        console.log("I am here");
                        
                        // return
                        return _widget;
                };     
        });
