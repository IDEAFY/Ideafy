/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "service/map", "Amy/Stack-plugin", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "service/config", "Promise", "Store"],
        function(Widget, Map, Stack, Model, Event, CouchDBStore, Config, Promise, Store){
                
           return function MultiBConstructor($sip, $exit){
           
                var widget = new Widget(),
                    dom = Map.get("ideafy-multi"),
                    stack = new Stack();
                    
                widget.plugins.add("mustack", _stack);
                
                widget.template = '<div><input type="range"></div>';
                
                widget.alive(dom);
                
                widget.replayMUSession = function replayMUSession(){}; // may should be an observer instead
                
                
                widget.init = function init(sip){        
                };
                
                return widget;
                   
           };
});
  