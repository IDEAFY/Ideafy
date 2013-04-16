/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "service/help"],
        function(Widget, Map, Model, Event, Config, Help){
                
                return function MUStartConstructor($session, $prev, $next, $progress){
                        
                        // declaration
                        var _widget = new Widget(),
                            _user = Config.get("user"),
                            _db = Config.get("db"),
                             _labels = Config.get("labels"),
                             _next = "step";
                        
                        // setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "model" : new Model($session),
                                "mustartevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "mustart"><div class="previousbutton" data-mustartevent="listen: touchstart, press; listen: touchstart, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickstart" data-mustartevent="listen:touchstart, toggleProgress"></div><div class="help-brainstorm" data-qmustartevent="listen:touchstart, help"></div><form class="quickstart-form"><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="quickstart-title" autofocus="" name="title" data-model="bind:innerHTML, title"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="quickstart-desc" name="description" data-model="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-mustartevent="listen: touchstart, press; listen:touchend, next"></div></form><div>';
                        
                        _widget.place(Map.get("mustart"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
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
                                        $session.sync(_db, $session.get("_id"));
                                        
                                        // set session in progress in user document
                                        _user.set("sessionInProgress", {id : $session.get("_id"), type: "quick"});
                                        _user.upload().then(function(){
                                                node.classList.remove("pressed");
                                                // next step
                                                $next("quickstart");        
                                        });
                                        
                                }
                                else{
                                        node.classList.remove("pressed");
                                        $next("quickstart");        
                                }
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickstart");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress(node);               
                        };
                        
                        _widget.reset = function reset(replay){
                                _next = "step";
                        };
                        
                        _widget.help = function(event, node){
                                Help.setContent("mustarthelp");
                                document.getElementById("cache").classList.add("appear");
                                document.getElementById("help-popup").classList.add("appear");
                         };
                        
                        // init
                        
                        // return
                        return _widget;
                };     
        });
