/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "Store"],
        function(Widget, Map, Model, Event, Config, Store){
                
                function ConfirmConstructor($parent, $question, $onDecision, $class){
                
                        var _labels = Config.get("labels"),
                                _widget = this,
                                _content = new Store({"question":$question}),
                                _callback = $onDecision;
                        
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
                                if ($class === "EULA") Map.get("cache").classList.remove("EULA");
                                _callback && _callback(true);    
                        };
                        
                        _widget.cancel = function(event, node){
                                node && node.classList.remove("pressed");
                                Map.get("cache").classList.remove("appear");
                                if ($class === "EULA") Map.get("cache").classList.remove("EULA");
                                _callback && _callback(false);
                        };
                        
                        _widget.close = function close(){
                                Map.get("cache").classList.remove("appear");
                                if ($class === "EULA") Map.get("cache").classList.remove("EULA");
                                $parent && $parent.removeChild($parent.lastChild);       
                        };
                        
                        _widget.hide = function hide(){
                                Map.get("cache").classList.remove("appear");
                                if ($class === "EULA") Map.get("cache").classList.remove("EULA");
                                _widget.dom.classList.add("invisible");        
                        };
                        
                        _widget.show = function show(){
                                Map.get("cache").classList.add("appear");
                                if ($class === "EULA") {
                                        Map.get("cache").classList.add("EULA");
                                        _widget.dom.querySelector(".option.left").innerHTML = _labels.get("accept");
                                        _widget.dom.querySelector(".option.right").innerHTML = _labels.get("reject");
                                }
                                _widget.dom.classList.remove("invisible");        
                        };
                        
                        _widget.reset = function reset(question, callback){
                                _content.set("question", question);
                                _callback = callback;       
                        };
                        
                        _widget.render();
                        $parent && _widget.place($parent);
                        $class && _widget.dom.classList.add($class);
                        
                        if ($question){
                                _content.set("question", $question);
                        }
                        else{
                                _widget.hide();
                        }
                        
                        setTimeout(function(){_widget.close;}, 15000);
                        
                }
                        
                return function ConfirmFactory($parent, $question, $onDecision, $class){
                        ConfirmConstructor.prototype = new Widget();
                        return new ConfirmConstructor($parent, $question, $onDecision, $class);
                };
        });
