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
                            confirmUI, confirmCallBack,
                            exitListener,
                            exitDest;
                        
                        session.setTransport(Config.get("transport"));
                        
                        widget.template = '<div id="mubwait"><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickstart" data-quickstartevent="listen:touchstart, toggleProgress"></div><div class="help-brainstorm" data-quickstartevent="listen:touchstart, help"></div><form class="quickstart-form"><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="quickstart-title" autofocus="" name="title" data-model="bind:value, title; bind: setTitle, initiator"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="quickstart-desc" name="description" data-model="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickstartevent="listen: touchstart, press; listen:touchend, next"></div></form></div>';
                        
                        widget.place(document.getElementById("mubwait"));
                        confirmUI = new Confirm(widget.dom);
                        confirmUI.hide();
                        confirmCallBack = function(decision){
                                if (!decision){
                                        confirmUI.hide();
                                }
                                else{
                                        if (session.get("initiator").id === user.get("_id")){
                                                widget.cancelSession();
                                        }
                                        else {
                                                widget.leaveSession();
                                        }
                                }
                        };
                        
                        widget.reset = function reset(sid){
                                session.reset();
                                session.sync(Config.get("db"), sid).then(function(){
                                        // manage exit event
                                        // step 1 create confirmation UI
                                        if (session.get("initiator").id === user.get("_id")){
                                                confirmUI.reset(labels.get("leaderleave"), confirmCallBack);        
                                        }
                                        else {
                                                confirmUI.reset(labels.get("participantleave"), confirmCallBack);        
                                        }
                                        // step 2 create exit listener
                                        exitListener = Utils.exitListener("mubwait", widget.leave);      
                                });
                        };
                        
                        // initiator or a participant decides to leave the waiting room
                        widget.leave = function leave(target){
                                exitDest = target;
                                confirmUI.show();       
                        };
                        
                        // participant decides to leave session
                        widget.leaveSession = function leaveSession(dest){
                                         
                        };
                        
                        // initiator decides to cancel the session
                        widget.cancelSession = function cancelSession(dest){
                                       
                        };
                        
                        return widget;
                
                };
        
})