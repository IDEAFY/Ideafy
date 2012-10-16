define("Ideafy/Brainstorm/QuickSetup", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Model, Event, Config){
                
                return function QuickSetupConstructor($session, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                             _labels = Config.get("labels");
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "quicksetupevent": new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quicksetup"><div class="previousbutton" data-quicksetupevent="listen: touchstart, press; listen: click, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quicksetup" data-quicksetupevent="listen:click, toggleProgress"></div><div class="drawarea"><div class="decks"><div class="drawbutton drawchar" "name"="char" data-quicksetupevent="listen: touchstart, push; listen:click, draw"></div><div class="drawbutton drawcontext" "name"="context" data-quicksetupevent="listen: touchstart, push; listen:click, draw"></div><div class="drawbutton drawproblem" name="problem" data-quicksetupevent="listen: touchstart, push; listen:click, draw"></div></div><div class="cards"><div class="card char defaultchar" data-quicksetupevent="listen: touchstart, select; listen:click, zoom"><div class="cardpicture"></div><div class="cardtitle">Name</div></div><div class="card context defaultcontext" data-quicksetupevent="listen: touchstart, select; listen:click, zoom"><div class="cardpicture"></div><div class="cardtitle">Name</div></div><div class="card problem defaultproblem" data-quicksetupevent="listen: touchstart, select; listen:click, zoom"><div class="cardpicture"></div><div class="cardtitle">Name</div></div></div><div class="confirm"><div class="drawok" name="char" data-quicksetupevent="listen: touchstart, push; listen:click, accept"></div><div class="drawok" name="context" data-quicksetupevent="listen: touchstart, push; listen:click, accept"></div><div class="drawok" name="problem" data-quicksetupevent="listen: touchstart, push; listen:click, accept"></div></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quicksetupevent="listen: touchstart, press; listen:click, next"></div></div></div>';
                        
                        _widget.alive(Map.get("quicksetup"));
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        _widget.next = function(event, node){
                                node.classList.remove("pressed");
                                $next("quicksetup");
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quicksetup");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress(node);               
                        };
                        
                        _widget.push = function(event, node){
                                node.classList.add("pushed");
                        };
                        
                        _widget.draw = function(event, node){
                                var _type = node.getAttribute("name");
                                alert(_type);
                                node.classList.remove("pushed");        
                        };
                        
                        _widget.accept = function(event, node){
                                var _type = node.getAttribute("name"); 
                                alert(_type);
                                node.classList.remove("pushed");         
                        };
                        
                        _widget.select = function(event, node){
                                node.classList.add("highlighted");        
                        };
                        
                        _widget.zoom = function(event, node){
                                
                        };
                        
                        _widget.reset = function reset(){
                                // retrieve active deck      
                        };
                        
                        // Return
                        return _widget;
                };     
        });
