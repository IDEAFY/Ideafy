/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "service/help", "lib/spin.min"],
        function(Widget, Map, Model, Event, Config, Help, Spinner){
                
                return function MUStartConstructor($session, $prev, $next, $progress){
                        
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
                                "model" : new Model($session),
                                "mustartevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "mustart"><div class="previousbutton" data-mustartevent="listen: touchstart, press; listen: touchstart, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickstart" data-mustartevent="listen:touchstart, toggleProgress"></div><div class="help-brainstorm" data-qmustartevent="listen:touchstart, help"></div><form class="quickstart-form"><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="quickstart-title" autofocus="" name="title" data-model="bind:innerHTML, title"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="quickstart-desc" name="description" data-model="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-mustartevent="listen: touchstart, press; listen:touchend, next"></div></form><div>';
                        
                        _widget.place(Map.get("mustart"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                
                                spinner.spin(node.parentNode);
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                                $next("mustart");

                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickstart");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress();               
                        };
                        
                        _widget.reset = function reset(replay){
                                _next = "step";
                                // reset chat window
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
