/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "Store", "CouchDBDocument", "service/map", "Bind.plugin", "Event.plugin", "Place.plugin", "service/config", "service/help", "service/utils", "service/confirm", "Promise", "service/avatar", "./session/mubchat", "lib/spin.min"],
        function(Widget, Store, CouchDBDocument, Map, Model, Event, Place, Config, Help, Utils, Confirm, Promise, Avatar, Chat, Spinner){
                
                return function MultiBWaitConstructor($exit, $start){
                
                        var widget = new Widget(),
                            session = new CouchDBDocument(),
                            participants = new Store(),
                            info = new Store({"msg":""}),
                            user = Config.get("user"),
                            labels = Config.get("labels"),
                            chatUI = new Chat(),
                            confirmUI, confirmCallBack,
                            exitListener = {"listener": null},
                            exitDest,
                            spinner = new Spinner({color:"#5F8F28", lines:10, length: 10, width: 6, radius:10, left: 269, top: 306}).spin();
                        
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
                                                if (desc) this.innerHTML = desc.replace(/\n/g, "<br>");
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
                        
                        widget.template = '<div id="mubwait"><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, waitingroomlbl"></div><div class="help-brainstorm" data-mubwaitevent="listen:mousedown, help"></div><form class="mubwait-form"><div class="mubwait-title" name="title" data-model="bind:setTitle, title" data-mubwaitevent="listen: keypress, checkUpdate; listen:blur, updateField"></div><div class="mubdesc"><label data-labels="bind:innerHTML, quickstepstart"></label><p name="description" data-model="bind:setDescription, description" data-mubwaitevent="listen: keypress, checkUpdate; listen:blur, updateField"></p></div><div class="mubroster"><label data-labels="bind:innerHTML, participants">Participants</label><div class="mubleader contact"><div data-model="bind:setAvatar, initiator.id"></div><p class="contact-name" data-model="bind:innerHTML, initiator.username"></p><p class="contact-intro" data-model="bind:setIntro, initiator.intro"></p></div><ul class="participants" data-participant="foreach"><li class="contact"><div data-participant="bind:setAvatar, id"></div><p class="contact-name" data-participant="bind:innerHTML, username"></p><p class="contact-intro" data-participant="bind:setIntro, intro"></p></li></ul></div><div class="start-button invisible" data-labels="bind:innerHTML, startbutton" data-model="bind: showStartButton, participants" data-mubwaitevent="listen: mousedown, press; listen:mouseup, start"></div><div class="exit-brainstorm" data-mubwaitevent="listen: mousedown, press; listen:mouseup, exit"></div></form><div class="sessionmsg invisible"> <span data-info="bind:innerHTML, msg"></span></div><div class="sessionchat" data-place="place:chat"></div></div>';
                        
                        widget.place(document.getElementById("mubwait"));
                        
                        widget.help = function(event, node){
                                Help.setContent("mustarthelp");
                                document.getElementById("cache").classList.add("appear");
                                document.getElementById("help-popup").classList.add("appear");
                         };
                        
                        // create confirmation UI
                        confirmUI = new Confirm(document.body,null,null, "musession-confirm");
                     
                        widget.reset = function reset(sid){
                                // clear previous UI (chat and main window)
                                chatUI.clear();
                                session.unsync();
                                session.reset({});
                                participants.reset([]);
                                
                                // get session info
                                session.sync(Config.get("db"), sid).then(function(){
                                        
                                        // manage exit event
                                        
                                        // create confirmation UI
                                        confirmCallBack = function(decision){
                                                if (!decision){
                                                        confirmUI.hide();
                                                }
                                                else{
                                                        user.set("sessionInProgress", "");
                                                        user.upload();
                                                        if (session.get("initiator").id === user.get("_id")){
                                                                widget.cancelSession();
                                                        }
                                                        else {
                                                                widget.leaveSession();
                                                        }
                                                }
                                        };
                                        
                                        // activate exit listener
                                        exitListener.listener = Utils.exitListener("mubwait", widget.leave);
                                        
                                        // init confirmation UI content
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
                                        user.set("sessionInProgress", {id: sid, type: "musession", mode:"join"});
                                        user.upload();
                                });
                        };
                        
                        widget.press = function(event,node){
                                node.classList.add("press");    
                        };
                        
                        widget.exit = function(event, node){
                                var now = new Date().getTime(),
                                      sched = session.get("scheduled") || null;
                                node.classList.remove("pressed");
                                if (sched && (sched - now) > 300000) $exit();
                                else confirmUI.show();
                        };
                        
                        /*
                         *  Function called by event listener
                         * If it's an immediate session or a scheduled session about to begin then display confirmation popup
                         */
                        
                        widget.leave = function leave(target){
                                var now = new Date().getTime();
                                exitDest = target.getAttribute("href") || target;
                                // href exists it is one of the nav options else probably a notify message (or future use)
                                if (!session.get("schedule") ||((session.get("schedule") - now) < 300000) ) confirmUI.show();
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
                                session.upload()
                                .then(function(){
                                        return chatUI.leave();
                                })
                                .then(function(){
                                        //widget.goToScreen();
                                        session.unsync();
                                        session.reset({});        
                                }); 
                                // no need to wait for upload result to leave session
                                $exit();
                                confirmUI.hide();           
                        };
                        
                        // initiator decides to cancel the session
                       widget.cancelSession = function cancelSession(){
                                var countdown = 5000;
                                
                                // remove event listener
                                document.removeEventListener(exitListener.listener);
                                
                                if (!session.get("participants").length) {
                                        confirmUI.hide();
                                        $exit;
                                        session.remove();
                                }
                                widget.displayInfo("deleting", countdown).then(function(){
                                        session.remove();
                                        $exit();
                                        confirmUI.hide();
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
                                            promise.fulfill();
                                    };
                                
                                confirmUI.hide();
                                document.body.removeChild(document.querySelector(".confirm"));
                                infoUI.classList.remove("invisible");
                                timer = setInterval(function(){
                                                if (message !== "deleting") {info.set("msg", message);}
                                                else {
                                                        info.set("msg", labels.get("deletingsession") + timeout/1000 + "s");
                                                }
                                                if (timeout <= 0) clearInfo();
                                                timeout -= 1000;
                                }, 1000);
                                
                                // remove session from CouchDB if cancel is called
                                if (message === "deleting"){
                                        //set session status to "deleted" to notify participants
                                        session.set("status", "deleted");
                                        session.upload().then(function(){
                                                chatUI.cancel();
                                        });        
                                }
                                return promise;
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
                                widget.updateSession(field, node.innerHTML);        
                        };
                        
                        widget.updateSession = function updateSession(field, value){
                                if (session.get(field) !== value){
                                        session.set(field, value);
                                        session.upload();
                                }        
                        };
                        
                        // handle start button
                        widget.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        widget.start = function(event, node){
                                var now = new Date(), chat = session.get("chat");
                                // remove confirmUI if any
                                document.body.removeChild(document.querySelector(".confirm"));
                                // notify session start in chat window
                                chatUI.conclude("start");
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                                spinner.spin(node.parentNode);
                                
                                // make changes to session document
                                session.set("status", "in progress");
                                session.set("step", "musetup");
                                session.set("startTime", now.getTime());
                                session.set("date", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                chat.push(session.get("_id")+"_1");
                                session.set("chat", chat);
                                
                                // create chat document for next phase then upload session
                                widget.createChat(session.get("chat")[1])
                                .then(function(){
                                        return session.upload();
                                })
                                .then(function(){
                                        session.unsync();
                                        spinner.stop();
                                        node.classList.remove("invisible");
                                        $start(session.get("_id"));        
                                });
                        };
                        
                        widget.createChat = function createChat(id){
                                var cdb = new CouchDBDocument(),
                                now = new Date().getTime(),
                                promise = new Promise();
                                cdb.setTransport(Config.get("transport"));
                        
                                cdb.set("users", chatUI.getModel().get("users"));
                                cdb.set("msg", [{user: "SYS", "type": 5, "arg": "quicksetup", "time": now}]);
                                cdb.set("sid", session.get("_id"));
                                cdb.set("lang", session.get("lang"));
                                cdb.set("readonly", false); // once the step is cleared readonly is set to true
                                cdb.set("step", 1);
                                cdb.set("type", 17);
                                cdb.sync(Config.get("db"), id)
                                .then(function(){
                                        return cdb.upload();
                                })
                                .then(function(){
                                        promise.fulfill();
                                        cdb.unsync();
                                });
                                return promise;
                        };

                        
                        // watch for session status change
                        session.watchValue("status", function(value){
                                // if session is deleted (in case initiator decides to cancel)
                                if (value === "deleted" && session.get("initiator").id !== user.get("_id")){
                                        session.unsync();
                                        widget.displayInfo(labels.get("canceledbyleader"), 2000).then(function(){
                                                document.removeEventListener(exitListener.listener);
                                                $exit();     
                                        });
                                }
                                if (value === "in progress" && session.get("initiator").id !== user.get("_id")){
                                        session.unsync();
                                        $start(session.get("_id"));
                                        session.reset({});
                                        participants.reset([]);
                                }     
                        });
                        
                        // watch participant changes (new participant, departure etc.)
                        session.watchValue("participants", function(array){
                                participants.reset(array);        
                        });
                        
                        return widget;
                
                };
        
});