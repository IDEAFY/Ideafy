/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "service/config", "Promise", "Store"],
        function(Widget, Model, Event, CouchDBStore, Config, Promise, Store){
                
           return function NewMUBConstructor($exit){
           
                var widget = new Widget();
                
                widget.plugins.addAll({});
                
                widget.template = '<div id="newmub">New multi-user session<form></form></div>';
                
                widget.place(document.getElementById("newmub"));
                
                widget.reset = function reset(){        
                };
                
                return widget;
                   
           };
});