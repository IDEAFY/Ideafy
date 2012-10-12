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
                        
                        _widget.template = '<div id = "quicktech"><div class="previousbutton" data-quicktechevent="listen: touchstart, press; listen: click, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quicktech" data-quicktechevent="listen:click, toggleProgress"></div><div id="quicktech-left" class="leftarea"><div class="card defaultscenario" name="scenario" data-quicktechevent="listen: touchstart, select; listen:click, zoom"><div class="cardpicture"></div><div class="cardtitle">Your Story</div></div></div><div class="drawarea"><div class="decks"><div class="drawbutton drawtech" "name"="tech" data-quicktechevent="listen: touchstart, push; listen:click, draw"></div></div><div class="cards"><div class="card tech defaulttech" data-quicktechevent="listen: touchstart, select; listen:click, zoom"><div class="cardpicture"></div><div class="cardtitle">Tech 1</div></div><div class="card tech defaulttech" data-quicktechevent="listen: touchstart, select; listen:click, zoom"><div class="cardpicture"></div><div class="cardtitle">Tech 2</div></div><div class="card tech defaulttech" data-quicktechevent="listen: touchstart, select; listen:click, zoom"><div class="cardpicture"></div><div class="cardtitle">Tech 3</div></div></div><div class="confirm"><div class="drawok" name="tech1" data-quicktechevent="listen: touchstart, push; listen:click, accept"></div><div class="drawok" name="tech 2" data-quicksetupevent="listen: touchstart, push; listen:click, accept"></div><div class="drawok" name="tech 3" data-quicktechevent="listen: touchstart, push; listen:click, accept"></div></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quicktechevent="listen: touchstart, press; listen:click, next"></div></div></div>';
                        
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
                        
                        _widget.select = function(event, node){
                                node.classList.add("highlighted");        
                        };
                        
                        _widget.zoom = function(event, node){
                                
                        };
                        
                        _widget.push = function(event, node){
                                node.classList.add("pushed");
                        };
                        
                        _widget.draw = function(event, node){
                                node.classList.remove("pushed");        
                        };
                        
                        _widget.accept = function(event, node){
                                node.classList.remove("pushed");         
                        };
                        
                        // Return
                        return _widget;
                };     
        });
