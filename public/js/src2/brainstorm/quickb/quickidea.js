define("Ideafy/Brainstorm/QuickIdea", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Model, Event, Config){
                
                return function QuickIdeaConstructor($session, $data, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                             _labels = Config.get("labels");
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "quickideaevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickidea"><div class="previousbutton" data-quickideaevent="listen: touchstart, press; listen: touchstart, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickidea" data-quickideaevent="listen:touchstart, toggleProgress"></div><div id="quickidea-left" class="leftarea"><div class="card defaultscenario" name="scenario" data-quickideaevent="listen: touchstart, select; listen:touchend, zoom"><div class="cardpicture"></div><div class="cardtitle">Your Story</div></div><ul class="cardlist"><li><div class="card tech defaultcard" name="scenario" data-quickideaevent="listen: touchstart, select; listen:touchend, zoom"><div class="cardpicture"></div><div class="cardtitle">Tech1</div></div></li><li><div class="card tech defaultcard" name="scenario" data-quickideaevent="listen: touchstart, select; listen:touchend, zoom"><div class="cardpicture"></div><div class="cardtitle">Tech2</div></div></li><li><div class="card tech defaultcard" name="scenario" data-quickideaevent="listen: touchstart, select; listen:touchend, zoom"><div class="cardpicture"></div><div class="cardtitle">Tech3</div></div></li></ul></div><div id="quickidea-right" class="workarea"><div id="idea-whiteboard" class="whiteboard"><div class="defaultcontent"><div class="doctor-deedee"></div><div class="help"><p>Welcome back to your <strong>whiteboard.</strong></p><p>Your goal now is to try to apply the technologies that you just picked to design a solution to the use case described in your scenario.</p><p>Again do not feel too constrained: at this stage you can either alter your scenario to accomodate a technology, add additional technologies to the ones you have drawn to complete your solution or skip some of these if they do not fit in your design.</p><p>You are almost done: at the end of this step you will be able to refine your use case and turn it into an <strong>idea</strong>. You will be asked to provide a description in layman terms and also to describe how you would implement it with your chosen technologies.</p><br><p>When you are done, clik on the <strong>ready</strong> button at the bottom to write up your story.</p></div></div></div><div id="toolbox" data-wbtools="bind:toggleToolbox, showstory"><div class="toolbox-button"><div class="postit-button" name="postit" data-wbtools="bind:setActive, postit" data-quickscenarioevent="listen: touchstart, push; listen:touchend, post"></div><legend>Post-it</legend></div><div class="toolbox-button"><div class="importpic-button" name="import" data-wbtools="bind:setActive, import" data-quickscenarioevent="listen: touchstart, push; listen:touchend, importpic"></div><legend>Import pictures</legend></div><div class="toolbox-button"><div class="drawingtool-button" name="drawing" data-wbtools="bind:setActive, drawing" data-quickscenarioevent="listen: touchstart, push; listen:touchend, draw"></div><legend>Drawing tool</legend></div></div><div id="finish-button" class="invisible" data-wbtools="bind:setReady, ready" data-labels="bind:innerHTML, finishbutton" data-quickscenarioevent="listen: touchstart, press; listen:touchend, finish"></div><div id = "quickscenario-writeup" class="writeup invisible" data-wbtools="bind: setReady,showstory"><textarea class = "enterTitle"></textarea><div class="setPrivate"></div><div class="setPublic"></div><textarea class = "enterDesc"></textarea><textarea class = "enterSol"></textarea><div class = "finish-button finish-writeup"></div></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickscenarioevent="listen: touchstart, press; listen:touchend, next"></div></div></div>';
                        
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
