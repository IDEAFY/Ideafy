/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "CouchDBStore", "service/map", "Olives/Model-plugin", "Olives/Event-plugin", "service/config", "service/help", "service/utils", "service/confirm"],
        function(Widget, CouchDBStore, Map, Model, Event, Config, Help, Utils, Confirm){
                
                return function MultiBWaitConstructor($exit){
                
                        var widget = new Widget(),
                            session = new CouchDBStore(),
                            user = Config.get("user"),
                            labels = Config.get("labels"),
                            confirmUI, confirmCallBack,
                            exitListener,
                            exitDest;
                        
                        session.setTransport(Config.get("transport"));
                        
                        widget.plugins.addAll({
                                labels: new Model(labels),
                                model: new Model(session)
                        });
                        
                        widget.template = '<div id="mubwait"><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, waitingroomlbl" data-quickstartevent="listen:touchstart, toggleProgress"></div><div class="help-brainstorm" data-quickstartevent="listen:touchstart, help"></div><form class="mubwait-form"><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><div class="quickstart-title" autofocus="" name="title" data-model="bind:innerHTML, title"></div><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><div class="quickstart-desc" name="description" data-model="bind:innerHTML, description"></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickstartevent="listen: touchstart, press; listen:touchend, next"></div></form></div>';
                        
                        widget.place(document.getElementById("mubwait"));
                        confirmUI = new Confirm(widget.dom);
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
                                exitDest = target.getAttribute("href");
                                Map.get("cache").classList.add("appear");
                                confirmUI.show();       
                        };
                        
                        // participant decides to leave session
                        widget.leaveSession = function leaveSession(){
                                var p = session.get("participants"), i;
                                for (i=p.length-1; i>=0; i--){
                                        if (p[i].id === user.get("_id")){
                                               p.splice(i, 1);
                                               break; 
                                        }
                                }
                                session.set("participants", p);
                                session.upload();
                                widget.goToScreen();               
                        };
                        
                        // initiator decides to cancel the session
                        widget.cancelSession = function cancelSession(){
                                console.log(exitDest);               
                        };
                        
                        // switch screen to destination if user confirms exit
                        widget.goToScreen = function goToScreen(){
                                ["#public", "#library", "#brainstorm", "#connect", "#dashboard"].forEach(function(name){
                                        if (exitDest.search(name) > -1){
                                                Config.get("observer").notify("goto-screen", name);
                                                if (name === "#brainstorm"){
                                                        $exit();
                                                }
                                                document.removeEventListener("touchstart", exitListener, true);
                                        }
                                });
                                
                        };
                        
                        return widget;
                
                };
        
})