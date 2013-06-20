/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Amy/Stack-plugin", "Bind.plugin", "Event.plugin", "CouchDBDocument", "CouchDBView", "service/config", "Promise", "Store", "./mubinit", "./mubwait", "./session/mucontroller", "lib/spin.min"],
        function(Widget, Stack, Model, Event, CouchDBDocument, CouchDBView, Config, Promise, Store, MUInit, MUWait, MUController, Spinner){
                
           return function MultiBConstructor($sip, $exit){
           
                var widget = new Widget(),
                    stack = new Stack(),
                    user = Config.get("user"),
                    muWait, muInit, muController,
                    spinner = new Spinner({color:"#9AC9CD", lines:10, length: 12, width: 6, radius:10, top: 328}).spin();
                
                widget.plugins.add("mustack", stack);
                
                widget.template = '<div id="ideafy-multi"><div class="stack" data-mustack="destination"></div></div>';
                
                widget.place(document.getElementById("ideafy-multi"));
                
                 widget.reset = function reset(sip){ 
                        if (!sip){
                                muInit.reset();
                                stack.getStack().show("mubinit");        
                        }
                        else if (sip.mode === "join"){
                                widget.join(sip.id);        
                        }
                        else{
                                widget.replayMUSession(sip.id);
                        }      
                };
                
                // used to replay session
                widget.replayMUSession = function replayMUSession(id){
                        muController.reset(id, true);
                        stack.getStack().show("musession");       
                };
                
                // joining an existing session
                
                widget.join = function join(sid){
                        var cdb = new CouchDBDocument();
                        
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(Config.get("db"), sid).then(function(){
                                var p = cdb.get("participants"), join = false;
                                // if not already joined (rejoin possible)
                                p.forEach(function(participant){
                                        if (participant.id === user.get("_id")){
                                                join = true;
                                        }        
                                });
                                
                                if (!join){
                                        p.push({"id": user.get("_id"), "username": user.get("username"), "intro": user.get("intro")});
                                        cdb.set("participants", p);
                                        // set session to full if there are 3 participants + leader
                                        if (p.length === 3) {cdb.set("status", "full");}
                                        cdb.upload().then(function(){
                                                muWait.reset(sid);
                                                stack.getStack().show("mubwait");
                                        }, function(error){
                                                console.log(error);
                                                alert("failed to join session");
                                        }); 
                                }
                                else{
                                        if (cdb.get("step") === "mustart"){
                                                muWait.reset(sid);
                                                stack.getStack().show("mubwait");        
                                        }
                                        else{
                                                widget.startSession(sid);        
                                        }
                                        
                                }               
                        }, function(error){
                                console.log(error);
                                alert("failed to join session");
                        });                             
                };
                
                // starting a session
                widget.startSession = function startSession(sid){
                        stack.getStack().show("musession");
                        muController.reset(sid);
                                        
                };
                
                // --- INIT ---
                // Musession main stack has three widgets : the init (new or join), the waiting room and the session itself //
                muInit = new MUInit($exit);
                muWait = new MUWait($exit, widget.startSession);
                muController = new MUController($exit);
                
                // Add widgets to the stack
                stack.getStack().add("mubinit", muInit);
                stack.getStack().add("mubwait", muWait);
                stack.getStack().add("musession", muController);
                
                if (!$sip){
                        stack.getStack().show("mubinit");
                }
                else {
                        if ($sip.mode === "join"){
                                console.log("joining session", $sip);
                                widget.join($sip.id);        
                        }
                        else{
                                widget.replayMUSession($sip.id);
                        }
                }
                
                // watch mu session events
                Config.get("observer").watch("start-mu_session", function(sid){
                        muWait.reset(sid);
                        stack.getStack().show("mubwait");
                });
                
                // session tools for dev/testing purposes only
                MUBSPIN = spinner;
                DELCHAT = function delChat(){
                        var cdb = new CouchDBView();
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(Config.get("db"), "chat", "_view/all")
                        .then(function(){
                                cdb.loop(function(v,i){
                                        var doc = new CouchDBDocument();
                                        doc.setTransport(Config.get("transport"));
                                        doc.sync(Config.get("db"), v.id).then(function(){
                                                setTimeout(function(){doc.remove();}, 150);
                                        });
                                }); 
                                console.log("chat documents removed"); 
                        });       
                };
                
DELMUSESSIONS = function delMusessions(){
                      var cdb = new CouchDBView();
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(Config.get("db"), "library", "_view/sessions")
                        .then(function(){
                                cdb.unsync();
                                cdb.loop(function(v,i){
                                        var doc = new CouchDBDocument();
                                        doc.setTransport(Config.get("transport"));
                                        if (v.id.search("S:MU") >-1){
                                                doc.sync(Config.get("db"), v.id).then(function(){
                                                        setTimeout(function(){doc.remove();}, 150);
                                                });
                                        }
                                }); 
                                console.log("multi user session documents removed");
                        });  
                };
                
                return widget;
                   
           };
});
  