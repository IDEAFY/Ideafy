/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "Store"],
        function(Widget, Map, Model, Event, Config, Store){
                
                return function ConfirmConstructor(){
                
                        var _labels = Config.get("labels"),
                                _widget = new OObject(),
                                _content = new Store({"question":""}),
                                _callback, _class;
                        
                        _widget.plugins.addAll({
                                "label" : new Model(_labels),
                                "confirm" : new Model(_content),
                                "confirmevent" : new Event(this)
                        });
                        
                        _widget.template = '<div class = "confirm"><div class="help-doctor"></div><p class="confirm-question" data-confirm="bind:innerHTML,question"></p><div class="option left" data-confirmevent="listen:mousedown, press; listen:mouseup, ok" data-label="bind: innerHTML, continuelbl">Continue</div><div class="option right" data-confirmevent="listen:mousedown, press; listen:mouseup, cancel" data-label="bind:innerHTML, cancellbl">Cancel</div></div>';
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                                event.stopPropagation();
                        };
                        
                        _widget.ok = function(event, node){
                                node.classList.remove("pressed");
                                Map.get("cache").classList.remove("appear");
                                if (_class === "EULA") Map.get("cache").classList.remove("EULA");
                                _callback && _callback(true);    
                        };
                        
                        _widget.cancel = function(event, node){
                                node && node.classList.remove("pressed");
                                Map.get("cache").classList.remove("appear");
                                if (_class === "EULA") Map.get("cache").classList.remove("EULA");
                                _callback && _callback(false);
                        };
                        
                        _widget.hide = function hide(){
                                Map.get("cache").classList.remove("appear");
                                if (_class === "EULA") Map.get("cache").classList.remove("EULA");
                                _class && _widget.dom.classList.remove(_class);
                                _widget.dom.classList.add("invisible");        
                        };
                        
                        _widget.show = function show(){
                                Map.get("cache").classList.add("appear");
                                if (_class === "EULA") {
                                        Map.get("cache").classList.add("EULA");
                                        _widget.dom.querySelector(".option.left").innerHTML = _labels.get("accept");
                                        _widget.dom.querySelector(".option.right").innerHTML = _labels.get("reject");
                                }
                                _widget.dom.classList.remove("invisible");
                                setTimeout(function(){_widget.close;}, 15000);      
                        };
                        
                        _widget.reset = function reset($question, $callback, $class){
                                _content.set("question", $question);
                                _callback = $callback;
                                _class = $class;
                                _class && _widget.dom.classList.add(_class);      
                        };
                        
                        _widget.alive(Map.get("confirm-popup"));
                        
                        if ($question){
                                _content.set("question", $question);
                        }
                        else{
                                _widget.hide();
                        }

                };
        });
