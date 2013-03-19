/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "service/config", "Promise", "Store"],
        function(Widget, Model, Event, CouchDBStore, Config, Promise, Store){
                
           return function MuListConstructor($exit){
           
                var widget = new Widget();
                
                widget.plugins.addAll({});
                
                widget.template = '<div id="mulist">Multi-user session list</div>';
                
                widget.place(document.getElementById("mulist"));
                
                widget.reset = function reset(){
                };
                
                return widget;
                   
           };
});