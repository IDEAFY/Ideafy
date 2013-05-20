/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "Store"],
        function(Widget, Map, Model, Event, Config, Store){
                
                return function MuVoteConstructor($session){
                
                        var _widget = new Widget(),
                            _labels = Config.get("labels"),
                            _user = Config.get("users");
                        
                        _widget.plugins.addAll({
                                "label" : new Model(_labels),
                                "model" : new Model(_vote),
                                "event" : new Event(_wdiget)
                        });
                        
                        _widget.template = '<div class = "confirm"><p class="confirm-question" data-confirm="bind:innerHTML,question"></p><div class="option left" data-confirmevent="listen:touchstart, press; listen:touchend, ok" data-label="bind: innerHTML, continuelbl">Continue</div><div class="option right" data-confirmevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl">Skip</div></div>';
                        
                        _widget.press = function(event, node){
                                event.stopPropagation();
                                node.classList.add("pressed");
                        };
                        
                        _widget.ok = function(event, node){
                                node.classList.remove("pressed");
                                Map.get("cache").classList.remove("appear");   
                        };
                        
                        _widget.cancel = function(event, node){
                                node && node.classList.remove("pressed");
                                Map.get("cache").classList.remove("appear");
                        };
                        
                        _widget.close = function hide(){
                                Map.get("cache").classList.remove("appear");
                                _widget.dom.classList.add("invisible");        
                        };
                        
                        _widget.show = function show(){
                                Map.get("cache").classList.add("appear");
                                _widget.dom.classList.remove("invisible");        
                        };
                        
                        _widget.reset = function reset(){       
                        };
                        
                        return _widget;       
                }
        });
