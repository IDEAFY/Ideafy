/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Amy/Stack-plugin", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "service/config", "Promise", "Store"],
        function(Widget, Stack, Model, Event, CouchDBStore, Config, Promise, Store){
                
           return function MultiBInitConstructor($exit){
           
                var widget = new Widget(),
                    stack = new Stack(),
                    labels = Config.get("labels");
                    
                widget.plugins.addAll({
                        "labels": new Model(labels),
                        "muinitstack": stack,
                        "muinitevent": new Event(widget)
                });
                
                widget.template = '<div id="mub-init"><div id="muinitsliderlbl"><label>Start a new session</label><label>Join a session</label></div><input id="muinitslider" type="range" min="0" max="1" value ="1" data-muinitevent="listen: touchend, toggleMode"><div class="stack" data-muinitstack="destination"></div></div>';
                
                widget.place(document.getElementById("mub-init"));
                
                widget.toggleMode = function(event, node){
                        alert(node.value);        
                };
                
                return widget;
                   
           };
});
  