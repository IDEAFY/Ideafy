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
                        
                        _widget.template = '<div id = "quickscenario"><div class="previousbutton" data-quickscenarioevent="listen: touchstart, press; listen: click, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickscenario" data-quickscenarioevent="listen:click, toggleProgress"></div><div id="quickscenario-left" class="leftarea"><div class = "card defaultchar" name="char" data-quickscenarioevent="listen: touchstart, select; listen:click, zoom"><div class="cardpicture"></div><div class="cardtitle">Character</div></div><div class="card defaultcontext" name="context" data-quickscenarioevent="listen: touchstart, select; listen:click, zoom"><div class="cardpicture"></div><div class="cardtitle">Context</div></div><div class="card defaultproblem" name="problem" data-quickscenarioevent="listen: touchstart, select; listen:click, zoom"><div class="cardpicture"></div><div class="cardtitle">Problem</div></div></div><div id="quickscenario-right" class="workarea"><div id="scenario-whiteboard" class="whiteboard"><div class="defaultcontent"><div class="doctor-deedee"></div><div class="help"><p>This is your <strong>whiteboard.</strong></p><p>Now is the time to show your creativity and imagination. The cards you just picked give you a scope, a set of directions to project your thoughts. Use them as hints but do not feel overly constrained: they are here to help you <strong>write your own story and describe your own use case</strong>.</p><p>Finding the problem to solve is often the most important step of an innovation. So get started and use the tools below to <strong>post any thought, drawing or picture that will help you focus on a story.</strong></p><br><p>When you are done, clik on the <strong>ready</strong> button at the bottom to write up your story.</p></div></div></div><div class="toolbox"><div class="toolbox-button"><div class="postit-button" data-quickscenarioevent="listen: touchstart, push; listen:click, post"></div><legend>Post-it</legend></div><div class="toolbox-button"><div class="importpic-button" data-quickscenarioevent="listen: touchstart, push; listen:click, import"></div><legend>Import pictures</legend></div><div class="toolbox-button"><div class="drawingtool-button" data-quickscenarioevent="listen: touchstart, push; listen:click, draw"></div><legend>Drawing tool</legend></div></div><div class="finish-button" data-labels="bind:innerHTML, finishbutton" data-quickscenarioevent="listen: touchstart, press; listen:click, finish"></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickscenarioevent="listen: touchstart, press; listen:click, next"></div></div></div>';
                        
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
                        
                        _widget.select = function(event, node){
                                node.classList.add("highlighted");        
                        };
                        
                        _widget.push = function(event, node){
                                node.classList.add("pushed");
                        };
                        
                        _widget.zoom = function(event, node){
                                
                        };
                        
                        _widget.post = function(event, node){
                                
                        };
                        
                        _widget.import = function(event, node){
                                
                        };
                        
                        _widget.draw = function(event, node){
                                
                        };
                        
                        _widget.finish = function(event, node){
                                
                        };
                        
                        // Return
                        return _widget;
                };     
        });
