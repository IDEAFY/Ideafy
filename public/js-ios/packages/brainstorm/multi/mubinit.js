/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      amy = require("../../../libs/amy2"),
      emily = require("../../../libs/emily"),
      Widget = olives.OObject,
      Stack = amy.StackPlugin,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Config = require("../../../services/config"),
      Promise = emily.Promise,
      Store = emily.Store,
      NewMUB = require("./init/newmub"),
      MUList = require("./init/mulist");

module.exports = function MultiBInitConstructor($exit){
           
                var widget = new Widget(),
                    newMub = new NewMUB($exit),
                    muList = new MUList($exit),
                    stack = new Stack(),
                    labels = Config.get("labels");
                    
                widget.seam.addAll({
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
                        // stack.getStack().get(ui).reset();
                        stack.getStack().show(ui);
                        stack.getStack().get(ui).reset();       
                };
                
                widget.press = function(event, node){
                        node.classList.add("pressed");        
                };
                
                widget.exit = function(event, node){
                        node.classList.remove("pressed");
                        $exit();      
                };
                
                widget.reset = function reset(){
                        newMub.reset();
                        muList.reset();
                };
                
                widget.showPreview = function showPreview(id){
                        muList.showPreview(id);
                        stack.getStack().show("list");
                        widget.dom.querySelector("#muinitslider").value = 0; 
                };
                
                // init
                stack.getStack().add("new", newMub);
                stack.getStack().add("list", muList);
                stack.getStack().show("new");
                
                // watch for events
                Config.get("observer").watch("show-session", function(session){
                        stack.getStack().show("list");
                        widget.dom.querySelector("#muinitslider").value = 0;              
                });
                
                return widget;
};  