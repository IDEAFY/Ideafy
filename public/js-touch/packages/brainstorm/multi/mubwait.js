/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "CouchDBStore", "service/map", "Olives/Model-plugin", "Olives/Event-plugin", "service/config", "service/help", "service/utils", "service/confirm"],
        function(Widget, CouchDBStore, Map, Model, Event, Config, Help, Utils, Confirm){
                
                return function MultiBWaitConstructor($prev, $next, $progress){
                
                        var widget = new Widget(),
                            session = new CouchDBStore(),
                            user = Config.get("user"),
                            labels = Config.get("labels"),
                            confirmUI,
                            exitListener;
                        
                        session.setTransport(Config.get("transport"));
                        
                        widget.template = '<div id="mubwait"></div>';
                        
                        widget.place(document.getElementById("mubwait"));
                        confirmUI = new Confirm(widget.dom);
                        confirmUI.hide();
                        
                        widget.reset = function reset(sid){
                                session.reset();
                                session.sync(Config.get("db"), sid).then(function(){
                                        exitListener = Utils.exitListener("mubwait", widget.leave);
                                        console.log("mubwait : "+sid, exitListener);       
                                });
                        };
                        
                        // initiator or a participant decides to leave the waiting room
                        widget.leave = function leave(target){
                                if (session.get("initiator").id === user.get("_id")){
                                        widget.cancelSession(target);
                                }
                                else {
                                        widget.leaveSession(target);
                                }       
                        };
                        
                        // participant decides to leave session
                        widget.leaveSession = function leaveSession(dest){
                                console.log("participant leaving", dest, exitListener);
                                confirmUI.reset(labels.get("participantleave", function(decision){
                                        if (decision){
                                                alert("bye bye");
                                                document.removeEventListener("touchstart", exitListener, true);
                                        }
                                }));         
                        };
                        
                        // initiator decides to cancel the session
                        widget.cancelSession = function cancelSession(dest){
                                console.log("leader leaving", dest);
                                confirmUI.reset(labels.get("leaderleave", function(decision){
                                        if (decision){
                                                alert("what about the others?");
                                                document.removeEventListener("touchstart", exitListener, true);
                                        }
                                }));        
                        };
                        
                        return widget;
                
                };
        
})