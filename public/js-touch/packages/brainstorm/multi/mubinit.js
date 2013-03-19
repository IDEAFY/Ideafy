/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Amy/Stack-plugin", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "service/config", "Promise", "Store", "./init/newmub", "./init/mulist"],
        function(Widget, Stack, Model, Event, CouchDBStore, Config, Promise, Store, NewMUB, MUList){
                
           return function MultiBInitConstructor($exit){
           
                var widget = new Widget(),
                    stack = new Stack(),
                    labels = Config.get("labels");
                    
                widget.plugins.addAll({
                        "labels": new Model(labels),
                        "muinitstack": stack,
                        "muinitevent": new Event(widget)
                });
                
                widget.template = '<div id="mub-init"><div id="muinitsliderlbl"><label data-labels="bind:innerHTML, startnewmub"></label><label data-labels="bind:innerHTML, joinmub"></label></div><input id="muinitslider" type="range" min="0" max="1" value ="1" data-muinitevent="listen: touchend, toggleMode"><div class="exit-brainstorm" data-muinitevent="listen: touchstart, press; listen: touchend, exit"></div><div class="stack" data-muinitstack="destination"></div></div>';
                
                widget.place(document.getElementById("mub-init"));
                
                widget.toggleMode = function(event, node){
                        var ui;
                        (node.value) ? ui="new" : ui="list";
                        stack.getStack().get(ui).reset();
                        stack.getStack().show(ui);       
                };
                
                widget.press = function(event, node){
                        node.classList.add("pressed");        
                };
                
                widget.exit = function(event, node){
                        node.classList.remove("pressed");
                        $exit();      
                };
                
                widget.reset = function(reset){
                        
                };
                
                // init
                stack.getStack().add("new", new NewMUB());
                stack.getStack().add("list", new MUList());
                stack.getStack().show("new");
                
                
                return widget;
                   
           };
});
  