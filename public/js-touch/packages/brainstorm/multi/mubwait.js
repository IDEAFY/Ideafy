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
                            listener;
                        
                        session.setTransport(Config.get("transport"));
                        
                        widget.template = '<div id="mubwait"></div>';
                        
                        widget.place(document.getElementById("mubwait"));
                        
                        widget.reset = function reset(sid){
                                session.reset();
                                session.sync(Config.get("db"), sid).then(function(){
                                        console.log("mubwait : "+sid);
                                        listener = Utils.exitListener("mubwait", widget.leave);        
                                });
                        };
                        
                        // initiator or a participant decides to leave the waiting room
                        widget.leave = function leave(target){
                                console.log("leave", target, user.get("_id"));
                                if (session.get("initiator").id === user.get("_id")){
                                        widget.cancelSession(target);
                                }
                                else {
                                        widget.leaveSession(target);
                                }
                                document.removeEventListener("touchstart", listener);        
                        };
                        
                        // participant decides to leave session
                        widget.leaveSession = function leaveSession(dest){
                                console.log("participant leaving");        
                        };
                        
                        // initiator decides to cancel the session
                        widget.cancelSession = function cancelSession(dest){
                                console.log("leader leaving");        
                        };
                        
                        return widget;
                
                };
        
})