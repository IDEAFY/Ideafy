/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Amy/Stack-plugin", "Bind.plugin", "Event.plugin", "CouchDBStore", "service/config", "Promise", "Store", "./mubinit", "./mubwait", "./session/mucontroller"],
        function(Widget, Stack, Model, Event, CouchDBStore, Config, Promise, Store, MUInit, MUWait, MUController){
                
           return function MultiBConstructor($sip, $exit){
           
                var widget = new Widget(),
                    stack = new Stack(),
                    user = Config.get("user");
                
                // Musession main stack has three widgets : the init (new or join), the waiting room and the session itself //
                stack.getStack().add("mubinit", new MUInit($exit));
                stack.getStack().add("mubwait", new MUWait($exit, widget.startSession));
                stack.getStack().add("musession", new MUController($exit));
                  
                widget.plugins.add("mustack", stack);
                
                widget.template = '<div id="ideafy-multi"><div class="stack" data-mustack="destination"></div></div>';
                
                widget.place(document.getElementById("ideafy-multi"));
                
                widget.replayMUSession = function replayMUSession(){}; // may should be an observer instead
                
                
                widget.reset = function reset(sip){ 
                        if (!sip){
                                stack.getStack().get("mubinit").reset();
                                stack.getStack().show("mubinit");        
                        }
                        else if (sip.mode === "join"){
                                widget.join(sip.id);        
                        }      
                };
                
                // used to replay session
                widget.view = function view(sid){
                        
                };
                
                // joining an existing session
                
                widget.join = function join(sid){
                        var mubWait = stack.getStack().get("mubwait"),
                            cdb = new CouchDBStore();
                        
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(Config.get("db"), sid).then(function(){
                                var p = cdb.get("participants");
                                p.push({"id": user.get("_id"), "username": user.get("username"), "intro": user.get("intro")});
                                cdb.set("participants", p);
                                // set session to full if there are 3 participants + leader
                                if (p.length === 3) cdb.set("status", "full");
                                cdb.upload().then(function(){
                                        mubWait.reset(sid);
                                        stack.getStack().show("mubwait");
                                }, function(error){
                                        console.log(error);
                                        alert("failed to join session");
                                });                
                        }, function(error){
                                console.log(error);
                                alert("failed to join session");
                        });                             
                };
                
                // starting a session
                widget.startSession = function startSession(sid){
                        MUController.reset(sid);
                        stack.getStack().show("musession");                
                };
                
                //init
                if (!$sip){
                        stack.getStack().show("mubinit");
                }
                else {
                        if ($sip.mode === "join"){
                                console.log("joining session", $sip);
                                widget.join($sip.id);        
                        }
                }
                
                // watch mu session events
                Config.get("observer").watch("start-mu_session", function(sid){
                        // show needs to be called prior to reset to make sure widget.dom exists in mubwait
                        stack.getStack().show("mubwait");
                        stack.getStack().get("mubwait").reset(sid);
                });
                
                return widget;
                   
           };
});
  