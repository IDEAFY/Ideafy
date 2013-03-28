/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "service/map", "Olives/Model-plugin", "Olives/Event-plugin", "service/config", "Store"],
        function(Widget, Map, Model, Event, Config, Store){
                
                function ConfirmConstructor($parent, $question, $onDecision){
                
                        var _labels = Config.get("labels"),
                                _widget = this,
                                _content = new Store({"question":$question}),
                                _callback = $onDecision;
                        
                        _widget.plugins.addAll({
                                "label" : new Model(_labels),
                                "confirm" : new Model(_content),
                                "confirmevent" : new Event(this)
                        });
                        
                        _widget.template = '<div class = "confirm"><div class="help-doctor"></div><p class="confirm-question" data-confirm="bind:innerHTML,question"></p><div class="option left" data-confirmevent="listen:touchstart, press; listen:touchend, ok" data-label="bind: innerHTML, continuelbl">Continue</div><div class="option right" data-confirmevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl">Cancel</div></div>';
                        
                        _widget.press = function(event, node){
                                event.stopPropagation();
                                node.classList.add("pressed");
                        };
                        
                        _widget.ok = function(event, node){
                                node.classList.remove("pressed");
                                _callback(true);    
                        };
                        
                        _widget.cancel = function(event, node){
                                node && node.classList.remove("pressed");
                                console.log("cancel pressed");
                                _callback(false);
                        };
                        
                        _widget.close = function close(){
                                $parent.removeChild($parent.lastChild);       
                        };
                        
                        _widget.hide = function hide(){
                                _widget.dom.classList.add("invisible");        
                        };
                        
                        _widget.show = function show(){
                                _widget.dom.classList.remove("invisible");        
                        };
                        
                        _widget.reset = function reset(question, callback){
                                _content.set("question", question);
                                _callback = callback;
                                console.log(callback);
                                _widget.show();        
                        };
                        
                        _widget.render();
                        _widget.place($parent);
                        
                        if ($question){
                                _content.set("question", $question);
                        }
                        else{
                                _widget.hide();
                        }
                        
                        setTimeout(function(){_widget.close;}, 15000);
                        
                }
                        
                return function ConfirmFactory($parent, $question, $onDecision){
                        ConfirmConstructor.prototype = new Widget();
                        return new ConfirmConstructor($parent, $question, $onDecision);
                };
        });
