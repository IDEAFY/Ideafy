/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Store", "CouchDBStore", "service/map", "Olives/Model-plugin", "Olives/Event-plugin", "service/config", "service/help", "service/utils", "service/confirm"],
        function(Widget, Store, CouchDBStore, Map, Model, Event, Config, Help, Utils, Confirm){
                
                return function MultiBWaitConstructor($exit){
                
                        var widget = new Widget(),
                            session = new CouchDBStore(),
                            info = new Store({"msg":""}),
                            user = Config.get("user"),
                            labels = Config.get("labels"),
                            confirmUI, confirmCallBack,
                            exitListener,
                            exitDest;
                        
                        session.setTransport(Config.get("transport"));
                        
                        widget.plugins.addAll({
                                labels: new Model(labels),
                                model: new Model(session),
                                info: new Model(info)
                        });
                        
                        widget.template = '<div id="mubwait"><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, waitingroomlbl"></div><div class="help-brainstorm" data-quickstartevent="listen:touchstart, help"></div><form class="mubwait-form"><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><div class="quickstart-title" autofocus="" name="title" data-model="bind:innerHTML, title"></div><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><div class="quickstart-desc" name="description" data-model="bind:innerHTML, description"></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickstartevent="listen: touchstart, press; listen:touchend, next"></div></form><div class="sessionmsg invisible" data-info="bind:innerHTML, msg"></div></div>';
                        
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
                                // set session status to waiting as it may have been "full" before participant left
                                session.set("status", "waiting"); 
                                session.upload();
                                widget.goToScreen();               
                        };
                        
                        // initiator decides to cancel the session
                        widget.cancelSession = function cancelSession(){
                                console.log(exitDest); 
                                //set session status to "deleted" to notify participants
                                session.set("status", "deleted");
                                session.upload().then(function(){
                                        widget.dispayInfo("deleting", 5000).then(function(){
                                                session.remove();
                                                widget.goToScreen();       
                                        });
                                });        
                        };
                        
                        // display info popup
                        widget.displayInfo = function displayInfo(message, timeout){
                                var timer, infoUI = document.querySelector(".sessionmsg"),
                                    promise = new Promise(),
                                    clearInfo = function(){
                                            infoUI.classList.add("invisible");
                                            clearInterval(timer);
                                            info.set("msg", "");
                                            promise.resolve();
                                    };
                                
                                infoUI.classList.remove("invisible");
                                timer = setInterval(function(){
                                                if (message !== "deleting") {info.set("msg", message);}
                                                else {
                                                        info.set("msg", labels.get("deletingsession")+timeout/1000+ " s");
                                                }
                                                if (timeout <= 0) clearInfo();
                                                timeout -= 1000;
                                }, 1000);
                                return promise;
                        };
                        
                        // switch screen to destination if user confirms exit
                        widget.goToScreen = function goToScreen(){
                                ["#public", "#library", "#brainstorm", "#connect", "#dashboard"].forEach(function(name){
                                        if (exitDest.search(name) > -1){
                                                confirmUI.close();
                                                $exit();
                                                Config.get("observer").notify("goto-screen", name);
                                                document.removeEventListener("touchstart", exitListener, true);
                                        }
                                });
                        };
                        
                        // watch for session status change to deleted (in case initiator decides to cancel)
                        session.watchValue("status", function(value){
                                if (value === "deleted"){
                                        alert("session canceled by the leader: it will end now");
                                        session.unsync();
                                        $exit();
                                        document.removeEvenetListener("touchstart", exitListener, true);
                                }        
                        });
                        
                        return widget;
                
                };
        
})