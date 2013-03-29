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
                    newMub = new NewMUB($exit),
                    muList = new MUList($exit),
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
                        if (node.value === "1"){ui="new";}
                        else {ui="list";}
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
                        var node = document.getElementById("muinitslider");
                        if (node.value === "1"){
                                newMub.reset();
                                stack.getStack().show("new");        
                        }
                        else{
                                muList.reset();
                                stack.getStack().show("list");
                        }
                };
                
                // init
                stack.getStack().add("new", newMub);
                stack.getStack().add("list", muList);
                stack.getStack().show("new");
                
                
                return widget;
                   
           };
});
  