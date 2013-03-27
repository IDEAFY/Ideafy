/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "CouchDBStore", "service/map", "Olives/Model-plugin", "Olives/Event-plugin", "service/config", "service/help", "service/utils"],
        function(Widget, CouchDBStore, Map, Model, Event, Config, Help, Utils){
                
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
                                        listener = Utils.preventExit("mubwait");        
                                });
                        };
                        
                        // initiator or a participant decides to leave the waiting room
                        widget.leave = function leave(){
                                console.log("leave", user.get("_id"));
                                document.removeEventListener(listener.event, listener.listener);        
                        };
                        
                        // initiator decides to cancel the session
                        widget.cancel = function cancel(){
                                
                        };
                        
                        return widget;
                
                };
        
})