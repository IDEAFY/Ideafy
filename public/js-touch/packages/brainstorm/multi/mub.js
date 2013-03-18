/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "service/map", "Amy/Stack-plugin", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "service/config", "Promise", "Store", "./mustart"],
        function(Widget, Map, Stack, Model, Event, CouchDBStore, Config, Promise, Store, MUStart){
                
           return function MultiBConstructor($sip, $exit){
           
                var widget = new Widget(),
                    dom = Map.get("ideafy-multi"),
                    stack = new Stack();
                    
                widget.plugins.add("mustack", _stack);
                widget.alive(dom);
                
                widget.init = function init(sip){
                        
                };
                
                return widget;
                   
           };
});
  