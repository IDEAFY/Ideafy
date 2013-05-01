/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "service/help", "lib/spin.min", "Promise"],
        function(Widget, Map, Model, Event, Config, Help, Spinner, Promise){
                
                return function QuickStartConstructor($session, $prev, $next, $progress){
                        
                        // declaration
                        var _widget = new Widget(),
                            _user = Config.get("user"),
                            _db = Config.get("db"),
                             _labels = Config.get("labels"),
                             _next = "step",
                             spinner = new Spinner({color:"#657B99", lines:10, length: 8, width: 4, radius:8, top: 360, left:545}).spin();
                             // deduct 20px from position shown in navigator
                        
                        // setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "model" : new Model($session, {
                                        setTitle : function(initiator){
                                                var _now = new Date();
                                                if (initiator && initiator.username) this.setAttribute("placeholder", _labels.get("quickstarttitleplaceholderpre")+initiator.username+_labels.get("quickstarttitleplaceholderpost"));
                                        }
                                }),
                                "quickstartevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickstart"><div class="previousbutton" data-quickstartevent="listen: touchstart, press; listen: touchstart, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickstart" data-quickstartevent="listen:touchstart, toggleProgress"></div><div class="help-brainstorm" data-quickstartevent="listen:touchstart, help"></div><form class="quickstart-form"><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="quickstart-title" autofocus="" name="title" data-model="bind:value, title; bind: setTitle, initiator"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="quickstart-desc" name="description" data-model="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickstartevent="listen: touchstart, press; listen:touchend, next"></div></form><div>';
                        
                        _widget.place(Map.get("quickstart"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                
                                spinner.spin(node.parentNode);
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                               
                               if (_next === "step"){
                                        _next = "screen";
                                        // if title field is empty, set placeholder value as the default title
                                        if ($session.get("title") === ""){
                                                $session.set("title", _labels.get("quickstarttitleplaceholderpre")+$session.get("initiator").username+_labels.get("quickstarttitleplaceholderpost"));      
                                        }
                                        
                                        // set session language to the user's language
                                        $session.set("lang", _user.get("lang"));
                                
                                        // IMPORTANT: the new session doc is created in CDB and the session document is synched for the entire session
                                        $session.set("_id", "S:QUICK:"+$session.get("startTime"));
                                        $session.sync(_db, $session.get("_id"))
                                        .then(function(){
                                                // set session in progress in user document
                                                _user.set("sessionInProgress", {id : $session.get("_id"), type: "quick"});
                                                return _user.upload();
                                        })
                                        .then(function(){
                                                // next step
                                                $next("quickstart"); 
                                        });
                                        
                                }
                                else{
                                        $next("quickstart");        
                                }
                        };
                        
                        _widget.stopSpinner = function stopSpinner(){
                                spinner.stop();
                                _widget.dom.querySelector(".next-button").classList.remove("invisible");   
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickstart");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress();               
                        };
                        
                        _widget.reset = function reset(sip){
                                var now = new Date(), step = $session.get("step"), promise = new Promise();
                                if (sip){
                                        (step === "quickstart") ? _next = "step" : _next = "screen";
                                        // set resume time (to be added to elapsed time) if session is still in progress
                                        if (step !== "quickwrapup") $session.set("resumeTime", now.getTime());    
                                }
                                else{
                                        $session.set("startTime", now.getTime());
                                        $session.set("date", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                        _next = "step";
                                }
                        };
                        
                        _widget.help = function(event, node){
                                Help.setContent("quickstarthelp");
                                document.getElementById("cache").classList.add("appear");
                                document.getElementById("help-popup").classList.add("appear");
                         };
                        
                        // return
                        return _widget;
                };     
        });
