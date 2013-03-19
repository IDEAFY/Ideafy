/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "service/config", "Promise", "Store"],
        function(Widget, Model, Event, CouchDBStore, Config, Promise, Store){
                
           return function NewMUBConstructor($exit){
           
                var widget = new Widget(),
                    labels= Config.get("labels"),
                    user = Config.get("user");
                
                widget.plugins.addAll({
                        "labels": new Model(labels)
                });
                
                widget.template = '<div id="newmub"><form><legend>New multi-user session</legend></form></div>';
                
                widget.place(document.getElementById("newmub"));
                
                widget.reset = function reset(){        
                };
                
                return widget;
                   
           };
});