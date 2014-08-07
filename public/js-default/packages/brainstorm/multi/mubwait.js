/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      emily = require("../../../libs/emily"),
      CouchDBTools = require("../../,,/libs/CouchDBTools"),
      Widget = olives.OObject,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Place = olives["Place.plugin"],
      CouchDBDocument = CouchDBTools.CouchDBDocument,
      Config = require("../../../services/config"),
      Map = require("../../../services/map"),
      Help = require("../../../services/help"),
      Utils = require("../../../services/utils"),
      Confirm = require("../../../services/confirm"),
      Avatar = require("../../../services/avatar"),
      Chat = require("./session/mubchat"),
      Promise = emily.Promise,
      Store = emily.Store,
      Spinner = require("../../../libs/spin.min");

module.exports = function MultiBWaitConstructor($exit, $start){
                
                        var widget = new Widget(),
                            session = new CouchDBDocument(),
                            participants = new Store(),
                            info = new Store({"msg":""}),
                            user = Config.get("user"),
                            labels = Config.get("labels"),
                            chatUI = new Chat(),
                            confirmCallBack,
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
                                        },
                                        setPresent : function(present){
                                                var idx = this.getAttribute("data-participant_id") || 0;
                                                (present || (user.get("_id") === participants.get(idx).id) ) ? this.setAttribute("style", "opacity: 1;") : this.setAttribute("style", "opacity: 0.4;");
                                        }
                                }),
                                info: new Model(info),
                                place : new Place({"chat": chatUI}),
                                mubwaitevent : new Event(widget)
                        });
                        
                        widget.template = '<div id="mubwait"><div class="brainstorm-header header blue-dark" data-labels="bind: innerHTML, waitingroomlbl"></div><div class="help-brainstorm" data-mubwaitevent="listen:mousedown, help"></div><form class="mubwait-form"><div class="mubwait-title" name="title" data-model="bind:setTitle, title" data-mubwaitevent="listen: keypress, checkUpdate; listen:blur, updateField"></div><div class="mubdesc"><label data-labels="bind:innerHTML, quickstepstart"></label><p name="description" data-model="bind:setDescription, description" data-mubwaitevent="listen: keypress, checkUpdate; listen:blur, updateField"></p></div><div class="mubroster"><label data-labels="bind:innerHTML, participants">Participants</label><div class="mubleader contact"><div data-model="bind:setAvatar, initiator.id"></div><p class="contact-name" data-model="bind:innerHTML, initiator.username"></p><p class="contact-intro" data-model="bind:setIntro, initiator.intro"></p></div><ul class="participants" data-participant="foreach"><li class="contact" data-participant="bind:setPresent, present"><div data-participant="bind:setAvatar, id"></div><p class="contact-name" data-participant="bind:innerHTML, username"></p><p class="contact-intro" data-participant="bind:setIntro, intro"></p></li></ul></div><div class="start-button invisible" data-labels="bind:innerHTML, startbutton" data-model="bind: showStartButton, participants" data-mubwaitevent="listen: mousedown, press; listen:mouseup, start"></div></form><div class="exit-brainstorm" data-mubwaitevent="listen: mousedown, press; listen:mouseup, exit"></div><div class="sessionmsg invisible"><span data-info="bind:innerHTML, msg"></span></div><div class="sessionchat" data-place="place:chat"></div></div>';
                        
                        widget.place(document.getElementById("mubwait"));
                        
                        widget.help = function(event, node){
                                Help.setContent("mustarthelp");
                                document.getElementById("cache").classList.add("appear");
                                document.getElementById("help-popup").classList.add("appear");
                         };
                        
                        widget.reset = function reset(sid){
                                // clear previous UI (chat and main window)
                                chatUI.clear();
                                session.unsync();
                                session.reset({});
                                participants.reset([]);
                                
                                // get session info
                                session.sync(Config.get("db"), sid).then(function(){
                                        
                                        // activate exit listener
                                        exitListener.listener = Utils.exitListener("mubwait", widget.leave);
                                        
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
                                else {
                                        // init confirmation UI content
                                        if (session.get("initiator").id === user.get("_id")){
                                                Confirm.reset(labels.get("leaderleave"), confirmCallBack, "musession-confirm");        
                                        }
                                        else {
                                                Confirm.reset(labels.get("participantleave"), confirmCallBack, "musession-confirm");        
                                        }
                                        Confirm.show("musession-confirm");
                                }
                        };
                        
                        /*
                         *  Function called by event listener
                         * If it's an immediate session or a scheduled session about to begin then display confirmation pop-up
                         */
                        
                        widget.leave = function leave(target){
                                var now = new Date().getTime();
                                exitDest = target.getAttribute("href") || target;
                                
                                if (session.get("initiator").id === user.get("_id")){
                                        Confirm.reset(labels.get("leaderleave"), confirmCallBack, "musession-confirm");
                                }
                                else {
                                        Confirm.reset(labels.get("participantleave"), confirmCallBack, "musession-confirm");
                                }
                                
                                if (!session.get("scheduled") ||((session.get("scheduled") - now) < 300000)) Confirm.show("musession-confirm");
                        };
                        
                        confirmCallBack = function confirmCallback(decision){
                                if (!decision){
                                        Confirm.hide();
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
                        
                        widget.leaveSession = function leaveSession() {
                                var p = session.get("participants"), i;

                                for ( i = p.length - 1; i >= 0; i--) {
                                         if (p[i].id === user.get("_id")) {
                                                p.splice(i, 1);
                                                break;
                                        }
                                }
                                
                                session.set("participants", p);
                                session.set("status", "waiting");
                                session.upload().then(function() {
                                        return chatUI.leave();
                                })
                                .then(function() {
                                        widget.goToScreen();
                                        session.unsync();
                                        session.reset({});
                                });
                                
                                $exit();
                                
                                Confirm.hide();
                        }; 

                        
                        widget.cancelSession = function cancelSession(){
                                var countdown = 5000;
                                
                                if (!session.get("participants").length) {
                                        widget.goToScreen();
                                        Confirm.hide(); 
                                        chatUI.cancel();
                                        session.remove()
                                        .then(function(res){
                                                console.log("session remove result : ", res);
                                        },
                                        function(err){
                                                console.log("session removal error: ", err)
                                        });
                                }
                                else widget.displayInfo("deleting", countdown).then(function(){
                                        session.remove();
                                        Confirm.hide();
                                        widget.goToScreen();
                                });       
                        };
                        
                        widget.displayInfo = function displayInfo(message, timeout){
                                var timer, infoUI = document.querySelector(".sessionmsg"),
                                      promise = new Promise(),
                                      clearInfo = function(){
                                                infoUI.classList.add("invisible");
                                                clearInterval(timer);
                                                info.set("msg", "");
                                                promise.fulfill();
                                      };
                                
                                Confirm.hide();
                                infoUI.classList.remove("invisible");
                                timer = setInterval(function(){
                                        if (message !== "deleting") info.set("msg", message);
                                        else info.set("msg", labels.get("deletingsession") + timeout/1000 + "s");
                                        if (timeout <= 0) clearInfo();
                                        timeout -= 1000;
                                }, 1000);
                                
                                if (message === "deleting"){
                                        session.set("status", "deleted");
                                        session.upload().then(function(){
                                                chatUI.cancel();
                                        });        
                                }
                                return promise;
                        };
                        
                        widget.goToScreen = function goToScreen(){
                                var id;
                                $exit();
                                document.removeEventListener("mousedown", exitListener.listener, true); 
                                
                                if (exitDest && exitDest.getAttribute && exitDest.getAttribute("data-notify_id")){
                                        Config.get("observer").notify("goto-screen", "#connect");  
                                        id = exitDest.getAttribute("data-notify_id");
                                        observer.notify("display-message", parseInt(id, 10));     
                                }
                                else {
                                        ["#public", "#library", "#brainstorm", "#connect", "#dashboard"].forEach(function(name){
                                                if (exitDest === name){
                                                        Config.get("observer").notify("goto-screen", name);
                                                }
                                        });
                                }
                        };
                        
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
                        
                        widget.start = function(event, node){
                                var now = new Date(), chat = session.get("chat"), p = session.get("participants").concat();
                                
                                if (session.get("initiator").id === user.get("_id")){
                                        chatUI.conclude("start");
                                        node.classList.add("invisible");
                                        node.classList.remove("pressed");
                                        spinner.spin(node.parentNode);
                                        
                                        session.set("status", "in progress");
                                        session.set("step", "musetup");
                                        session.set("startTime", now.getTime());
                                        session.set("date", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                        chat.push(session.get("_id")+"_1");
                                        session.set("chat", chat);
                                        
                                        for (i=p.length-1; i>=0; i--){
                                                if (!p[i].present) p.splice(i, 1);
                                        }
                                        session.set("participants", p);
                                
                                        widget.createChat(session.get("chat")[1])
                                        .then(function(){
                                                return session.upload();
                                        })
                                        .then(function(){
                                                session.unsync();
                                                spinner.stop();
                                                node.classList.remove("invisible");
                                                document.removeEventListener("mousedown", exitListener.listener, true);
                                                $start(session.get("_id"));        
                                        });
                                }
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

                        session.watchValue("status", function(value){
                                if (value === "deleted" && session.get("initiator").id !== user.get("_id")){
                                        session.unsync();
                                        widget.displayInfo(labels.get("canceledbyleader"), 2000).then(function(){
                                                document.removeEventListener("mousedown", exitListener.listener, true); 
                                                $exit();     
                                        });
                                }
                                if (value === "in progress" && session.get("initiator").id !== user.get("_id")){
                                        session.unsync();
                                        document.removeEventListener("mousedown", exitListener.listener, true); 
                                        $start(session.get("_id"));
                                        session.reset({});
                                        participants.reset([]);
                                }     
                        });
                        
                        session.watchValue("participants", function(array){
                               participants.reset(array);        
                        });
                        
                        return widget;
};