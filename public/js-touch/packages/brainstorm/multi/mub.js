/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Amy/Stack-plugin", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "service/config", "Promise", "Store", "./mubinit", "./mubwait"],
        function(Widget, Stack, Model, Event, CouchDBStore, Config, Promise, Store, MUInit, MUWait){
                
           return function MultiBConstructor($sip, $exit){
           
                var widget = new Widget(),
                    stack = new Stack();
                
                // Musession main stack has three widgets : the init (new or join), the waiting room and the session itself //
                stack.getStack().add("mubinit", new MUInit($exit));
                stack.getStack().add("mubwait", new MUWait($exit))
                  
                widget.plugins.add("mustack", stack);
                
                widget.template = '<div id="ideafy-multi"><div class="stack" data-mustack="destination"></div></div>';
                
                widget.place(document.getElementById("ideafy-multi"));
                
                widget.replayMUSession = function replayMUSession(){}; // may should be an observer instead
                
                
                widget.reset = function reset(sip){        
                };
                
                widget.join = function(sid){
                        join(sid);      
                };
                
                //init
                if (!$sip){
                        stack.getStack().show("mubinit");
                }
                else {
                        widget.reset($sip);
                }
                
                // watch mu session events
                Config.get("observer").watch("join-mu_session", function(sid){
                        stack.getStack().get("mubwait").reset(sid);
                        stack.getStack().show("mubwait"); 
                });
                
                return widget;
                   
           };
});
  