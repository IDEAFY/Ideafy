/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      amy = require("../../../libs/amy2"),
      emily = require("../../../libs/emily"),
      CouchDBTools = require("../../../libs/CouchDBTools"),
      Widget = olives.OObject,
      Stack = amy.StackPlugin,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      CouchDBDocument = CouchDBTools.CouchDBDocument,
      CouchDBView = CouchDBTools.CouchDBView,
      Config = require("../../../services/config"),
      Promise = emily.Promise,
      Store = emily.Store,
      MUInit = require("./mubinit"),
      MUWait = require("./mubwait"),
      MUController = require("./session/mucontroller"),
      Spinner = require("../../../libs/spin.min");

module.exports = function MultiBConstructor($sip, $exit){
           
                var widget = new Widget(),
                    stack = new Stack(),
                    user = Config.get("user"),
                    muWait, muInit, muController,
                    spinner = new Spinner({color:"#9AC9CD", lines:10, length: 12, width: 6, radius:10, top: 328}).spin();
                
                widget.seam.add("mustack", stack);
                
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
                        else if (sip.mode === "preview"){
                                widget.showPreview(sip.id);
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
                
                // displaying a session preview
                widget.showPreview = function showPreview(id){
                        muInit.showPreview(id);
                        stack.getStack().show("mubinit");        
                };
                
                // joining an existing session
                
                widget.join = function join(sid){
                        var cdb = new CouchDBDocument();
                        
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(Config.get("db"), sid).then(function(){
                                var p = cdb.get("participants").concat(), join = false;
                                
                                if (cdb.get("initiator").id === user.get("_id")) join = true;
                                
                                else p.forEach(function(part){
                                                if (part.id === user.get("_id")){
                                                        join = true;
                                                        part.present = true;
                                                        cdb.set("participants", p);
                                                        cdb.upload();
                                                }
                                        });
                                
                                if (!join){
                                        p.push({"id": user.get("_id"), "username": user.get("username"), "intro": user.get("intro"), "present": true});
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
                                        if (!cdb.get("step") || cdb.get("step") === "mustart"){
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
                                widget.join($sip.id);        
                        }
                        else if ($sip.mode === "preview"){
                                widget.showPreview($sip.id);
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
                
                return widget;
                   
};  