/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Store", "CouchDBStore", "service/map", "Bind.plugin", "Event.plugin", "Place.plugin", "service/config", "service/help", "service/utils", "service/confirm", "Promise", "service/avatar", "./session/mubchat"],
        function(Widget, Store, CouchDBStore, Map, Model, Event, Place, Config, Help, Utils, Confirm, Promise, Avatar, Chat){
                
                return function MultiBWaitConstructor($exit, $start){
                
                        var widget = new Widget(),
                            session = new CouchDBStore(),
                            participants = new Store(),
                            info = new Store({"msg":""}),
                            user = Config.get("user"),
                            labels = Config.get("labels"),
                            chatUI = new Chat(),
                            confirmUI, confirmCallBack,
                            exitListener = {"listener": null},
                            exitDest;
                        
                        session.setTransport(Config.get("transport"));
                        
                        widget.plugins.addAll({
                                labels: new Model(labels),
                                model: new Model(session, {
                                        setTitle : function(title){
                                                if (title) this.innerHTML = title;
                                                if (user.get("_id") === session.get("initiator").id){
                                                        this.setAttribute("contenteditable", true);
                                                }
                                                else {
                                                        this.setAttribute("contenteditable", false);        
                                                }
                                        },
                                        setDescription : function(desc){
                                                if (desc) this.innerHTML = desc;
                                                if (user.get("_id") === session.get("initiator").id){
                                                        this.setAttribute("contenteditable", true);
                                                }
                                                else {
                                                        this.setAttribute("contenteditable", false);        
                                                }
                                        },
                                        setAvatar : function setAvatar(id){
                                                var frag, ui;
                                                if (id){
                                                        this.setAttribute("style", "background:none;");
                                                        frag = document.createDocumentFragment();
                                                        ui = new Avatar([id]);
                                                        ui.place(frag);
                                                        (!this.hasChildNodes())?this.appendChild(frag):this.replaceChild(frag, this.firstChild);
                                                }
                                        },
                                        setIntro : function(intro){
                                                (intro) ? this.innerHTML = intro : this.innerHTML= " ";
                                        },
                                        showStartButton : function(participants){
                                                if (participants && participants.length && user.get("_id") === session.get("initiator").id){
                                                        this.classList.remove("invisible");
                                                }
                                                else{
                                                        this.classList.add("invisible");
                                                }
                                        }
                                }),
                                participant : new Model(participants, {
                                        setAvatar : function setAvatar(id){
                                                var frag, ui;
                                                if (id){
                                                        this.setAttribute("style", "background:none;");
                                                        frag = document.createDocumentFragment();
                                                        ui = new Avatar([id]);
                                                        ui.place(frag);
                                                        (!this.hasChildNodes())?this.appendChild(frag):this.replaceChild(frag, this.firstChild);
                                                }
                                        },
                                        setIntro : function(intro){
                                                (intro) ? this.innerHTML = intro : this.innerHTML= " ";
                                        }
                                }),
                                info: new Model(info),
                                place : new Place({"chat": chatUI}),
                                mubwaitevent : new Event(widget)
                        });
                        
                        widget.template = '<div id="mubwait"><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, waitingroomlbl"></div><div class="help-brainstorm" data-mubwaitevent="listen:touchstart, help"></div><form class="mubwait-form"><div class="mubwait-title" name="title" data-model="bind:setTitle, title" data-mubwaitevent="listen: keypress, checkUpdate; listen:blur, updateField"></div><div class="mubdesc"><label data-labels="bind:innerHTML, quickstepstart"></label><p name="description" data-model="bind:setDescription, description" data-mubwaitevent="listen: keypress, checkUpdate; listen:blur, updateField"></p></div><div class="mubroster"><label data-labels="bind:innerHTML, participants">Participants</label><div class="mubleader contact"><div data-model="bind:setAvatar, initiator.id"></div><p class="contact-name" data-model="bind:innerHTML, initiator.username"></p><p class="contact-intro" data-model="bind:setIntro, initiator.intro"></p></div><ul class="participants" data-participant="foreach"><li class="contact"><div data-participant="bind:setAvatar, id"></div><p class="contact-name" data-participant="bind:innerHTML, username"></p><p class="contact-intro" data-participant="bind:setIntro, intro"></p></li></ul></div><div class="start-button invisible" data-labels="bind:innerHTML, startbutton" data-model="bind: showStartButton, participants" data-mubwaitevent="listen: touchstart, press; listen:touchend, start"></div></form><div class="sessionmsg invisible"> <span data-info="bind:innerHTML, msg"></span></div><div class="sessionchat" data-place="place:chat"></div></div>';
                        
                        widget.place(document.getElementById("mubwait"));
                        
                        // create confirmation UI
                        confirmUI = new Confirm(widget.dom);
                     
                        widget.reset = function reset(sid){
                                var promise = new Promise();
                                // clear previous UI (chat and main window)
                                chatUI.clear();
                                session.unsync();
                                session.reset({});
                                
                                // create confirmation UI
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
                                
                                // get session info
                                session.sync(Config.get("db"), sid).then(function(){
                                        // manage exit event
                                        // step 1 init confirmation UI
                                        if (session.get("initiator").id === user.get("_id")){
                                                confirmUI.reset(labels.get("leaderleave"), confirmCallBack);        
                                        }
                                        else {
                                                confirmUI.reset(labels.get("participantleave"), confirmCallBack);        
                                        }
                                        // reset participants store
                                        participants.reset(session.get("participants")); 
                                        
                                        // reset chatUI
                                        chatUI.reset(session.get("chat")[0]);
                                        
                                        // set as session in progress
                                        user.set("sessionInProgress", {id: sid, type: "musession", mode:"rejoin"});
                                        user.upload();
                                        
                                        promise.fulfill();
                                });
                                
                                return promise;
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
                                                console.log("participant leaving : ", p[i].username);
                                               p.splice(i, 1);
                                               break; 
                                        }
                                }
                                session.set("participants", p);
                                // set session status to waiting as it may have been "full" before participant left
                                session.set("status", "waiting"); 
                                session.upload().then(function(){
                                        chatUI.leave().then(function(){
                                                //widget.goToScreen();
                                                session.unsync();
                                                session.reset({});        
                                        });
                                }); 
                                // no need to wait for upload result to leave session
                                widget.goToScreen()             
                        };
                        
                        // initiator decides to cancel the session
                        widget.cancelSession = function cancelSession(){
                                //set session status to "deleted" to notify participants
                                session.set("status", "deleted");
                                session.upload().then(function(){
                                        chatUI.cancel();
                                        widget.displayInfo("deleting", 5000).then(function(){
                                                session.remove();
                                                session.unsync();
                                                session.reset({});
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
                                        confirmUI.hide();
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
                                                        confirmUI.hide();
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
                        
                        // handle start button
                        widget.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        widget.start = function(event, node){
                                var now = new Date();
                                chatUI.startingSession();
                                node.classList.remove("pressed");
                                console.log("starting session");
                                session.set("status", "in progress");
                                session.set("step", "musetup");
                                session.set("startTime", now.getTime());
                                session.set("date", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                session.upload().then(function(){
                                        console.log("session start upload successful", $start);
                                        // unsync session & remove exit listener
                                        document.removeEventListener("touchstart", exitListener.listener, true);
                                        session.unsync();
                                        $start(session.get("_id"));
                                        session.reset({});
                                });
                        };
                        
                        // watch for session status change
                        session.watchValue("status", function(value){
                                console.log(value);
                               // if session is deleted (in case initiator decides to cancel)
                                if (value === "deleted" && session.get("initiator").id !== user.get("_id")){
                                        widget.displayInfo(labels.get("canceledbyleader"), 2000).then(function(){
                                                session.unsync();
                                                $exit();
                                                document.removeEventListener("touchstart", exitListener.listener, true);      
                                        });
                                }
                                if (value === "in progress" && session.get("initiator").id !== user.get("_id")){
                                        console.log("session in progress -- starting any moment now");
                                        // unsync session & remove exit listener
                                        document.removeEventListener("touchstart", exitListener.listener, true);
                                        session.unsync();
                                        $start(session.get("_id"));
                                }     
                        });
                        
                        // watch participant changes (new participant, departure etc.)
                        session.watchValue("participants", function(array){
                                participants.reset(array);        
                        });
                        
                        CHAT = chatUI.getModel();
                        
                        return widget;
                
                };
        
})