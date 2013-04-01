/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Store", "CouchDBStore", "service/map", "Bind.plugin", "Event.plugin", "service/config", "service/help", "service/utils", "service/confirm", "Promise"],
        function(Widget, Store, CouchDBStore, Map, Model, Event, Config, Help, Utils, Confirm, Promise){
                
                return function MultiBWaitConstructor($exit){
                
                        var widget = new Widget(),
                            session = new CouchDBStore(),
                            info = new Store({"msg":""}),
                            user = Config.get("user"),
                            labels = Config.get("labels"),
                            confirmUI, confirmCallBack,
                            exitListener = {"listener": null},
                            exitDest;
                        
                        session.setTransport(Config.get("transport"));
                        
                        widget.plugins.addAll({
                                labels: new Model(labels),
                                model: new Model(session, {
                                        setTitle : function(title){
                                                this.innerHTML = title;
                                                if (user.get("_id") === session.get("initiator").id){
                                                        this.setAttribute("contenteditable", true);
                                                }
                                                else {
                                                        this.setAttribute("contenteditable", false);        
                                                }
                                        },
                                        setDescription : function(desc){
                                                this.innerHTML = desc;
                                                if (user.get("_id") === session.get("initiator").id){
                                                        this.setAttribute("contenteditable", true);
                                                }
                                                else {
                                                        this.setAttribute("contenteditable", false);        
                                                }
                                        }
                                }),
                                info: new Model(info),
                                mubwaitevent : new Event(widget)
                        });
                        
                        widget.template = '<div id="mubwait"><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, waitingroomlbl"></div><div class="help-brainstorm" data-mubwaitevent="listen:touchstart, help"></div><form class="mubwait-form"><div class="mubwait-title" name="title" data-model="bind:setTitle, title" data-mubwaitevent="listen: keypress, checkUpdate; listen:blur, updateField"></div><div class="mubdesc"><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><div class="desc" name="description" data-model="bind:setDescription, description" data-mubwaitevent="listen: keypress, checkUpdate; listen:blur, updateField"></div></div><div class="mubroster"><label>Leader</label><div class="mubleader"></div><label>Participants</label><div class="participants"></div></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickstartevent="listen: touchstart, press; listen:touchend, next"></div></form><div class="sessionmsg invisible" data-info="bind:innerHTML, msg"></div></div>';
                        
                        widget.place(document.getElementById("mubwait"));
                        
                     
                        
                        widget.reset = function reset(sid){
                                // create confirmation UI
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
                                
                                // create listener
                                exitListener.listener = Utils.exitListener("mubwait", widget.leave);
                                
                                console.log(sid);
                                // get session info
                                session.reset();
                                session.sync(Config.get("db"), sid).then(function(){
                                        console.log("document sync successful");
                                        // manage exit event
                                        // step 1 init confirmation UI
                                        if (session.get("initiator").id === user.get("_id")){
                                                confirmUI.reset(labels.get("leaderleave"), confirmCallBack);        
                                        }
                                        else {
                                                confirmUI.reset(labels.get("participantleave"), confirmCallBack);        
                                        }
                                        console.log(session.get("initiator").id, user.get("_id"));   
                                });
                        };
                        
                        // initiator or a participant decides to leave the waiting room
                        widget.leave = function leave(target){
                                exitDest = target.getAttribute("href") || target;
                                // href exists it is one of the nav options else probably a notify message (or future use)
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
                                session.upload().then(function(){
                                        widget.goToScreen();
                                        session.unsync();
                                });              
                        };
                        
                        // initiator decides to cancel the session
                        widget.cancelSession = function cancelSession(){
                                //set session status to "deleted" to notify participants
                                session.set("status", "deleted");
                                session.upload().then(function(){
                                        widget.displayInfo("deleting", 5000).then(function(){
                                                session.remove();
                                                session.unsync();
                                                widget.goToScreen();       
                                        });
                                }, function(err){console.log(err);});        
                        };
                        
                        // display info popup
                        widget.displayInfo = function displayInfo(message, timeout){
                                var timer, infoUI = document.querySelector(".sessionmsg"),
                                    promise = new Promise(),
                                    clearInfo = function(){
                                            infoUI.classList.add("invisible");
                                            clearInterval(timer);
                                            info.set("msg", "");
                                            promise.fulfill();
                                    };
                                
                                console.log(infoUI, timeout);
                                confirmUI.hide();
                                infoUI.classList.remove("invisible");
                                timer = setInterval(function(){
                                                if (message !== "deleting") {info.set("msg", message);}
                                                else {
                                                        info.set("msg", labels.get("deletingsession") + timeout/1000 + "s");
                                                }
                                                if (timeout <= 0) clearInfo();
                                                timeout -= 1000;
                                }, 1000);
                                return promise;
                        };
                        
                        // switch screen to destination if user confirms exit
                        widget.goToScreen = function goToScreen(){
                                var id;
                                // if dest is specified (e.g. notify popup)
                                if (exitDest.getAttribute && exitDest.getAttribute("data-notify_id")){
                                        confirmUI.close();
                                        $exit();
                                        Config.get("observer").notify("goto-screen", "#connect");
                                        document.removeEventListener("touchstart", exitListener.listener, true);   
                                        id = exitDest.getAttribute("data-notify_id");
                                        observer.notify("display-message", parseInt(id, 10));     
                                }
                                // handle clicks on nav bar
                                else {
                                        ["#public", "#library", "#brainstorm", "#connect", "#dashboard"].forEach(function(name){
                                                if (exitDest === name){
                                                        confirmUI.close();
                                                        $exit();
                                                        Config.get("observer").notify("goto-screen", name);
                                                        document.removeEventListener("touchstart", exitListener.listener, true);
                                                }
                                        });
                                }
                        };
                        
                        // handle edit events
                        widget.checkUpdate = function(event, node){
                                var field = node.getAttribute("name");
                                if (event.keyCode === 13){
                                        widget.updateSession(field, node.innerHTML);
                                        node.blur();
                                }        
                        };
                        
                        widget.updateField = function(event, node){
                                var field = node.getAttribute("name");
                                console.log("blur event fired");
                                widget.updateSession(field, node.innerHTML);        
                        };
                        
                        widget.updateSession = function updateSession(field, value){
                                if (session.get(field) !== value){
                                        session.set(field, value);
                                        session.upload()
                                }        
                        };
                        
                        // watch for session status change to deleted (in case initiator decides to cancel)
                        session.watchValue("status", function(value){
                                if (value === "deleted" && session.get("initiator").id !== user.get("_id")){
                                        alert("session canceled by the leader: it will end now");
                                        session.unsync();
                                        $exit();
                                        document.removeEventListener("touchstart", exitListener.listener, true);
                                }        
                        });
                        
                        EXIT = exitListener;
                        return widget;
                
                };
        
})