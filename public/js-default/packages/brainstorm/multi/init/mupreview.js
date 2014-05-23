/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "CouchDBDocument", "Store", "Bind.plugin", "Event.plugin", "service/avatar", "service/utils", "lib/spin.min", "service/confirm"],
        function(Widget, Config, CouchDBDocument, Store, Model, Event, Avatar, Utils, Spinner, Confirm){
                
                return function MUPreviewConstructor(){
                        
                        var muPreviewUI = new Widget(),
                              labels = Config.get("labels"),
                              user = Config.get("user"),
                              transport = Config.get("transport"),
                              muCDB =  new CouchDBDocument(),
                              info = new Store({"msg":""}),
                              participants = new Store([]),
                              spinner = new Spinner({color:"#5F8F28", lines:10, length: 10, width: 6, radius:10, left: 269, top: 306}).spin(),
                              refreshList; // callback function when closing the preview window
                        
                        muCDB.setTransport(transport);
                        
                        muPreviewUI.plugins.addAll({
                                "labels" : new Model(labels),
                                "model" : new Model(muCDB, {
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
                                                this.innerHTML = desc.replace(/\n/g, "<br>");
                                                if (user.get("_id") === session.get("initiator").id){
                                                        this.setAttribute("contenteditable", true);
                                                }
                                                else {
                                                        this.setAttribute("contenteditable", false);        
                                                }
                                        },
                                        showDate : function(scheduled){
                                                (scheduled) ? this.classList.remove("invisible") : this.classList.add("invisible");        
                                        },
                                        setDate : function(scheduled){
                                                var date, now;
                                                if (scheduled){
                                                        this.setAttribute("style", "display:inline-block");
                                                        date = new Date(scheduled);
                                                        now = new Date();
                                                        if (date.toDateString() === now.toDateString()) this.innerHTML = labels.get("today");
                                                        else this.innerHTML = date.toLocaleDateString();
                                                }
                                                else{
                                                         this.setAttribute("style", "display:none");
                                                }
                                        },
                                        setTime : function(scheduled){
                                                var time, now;
                                                if (scheduled){
                                                         this.setAttribute("style", "display:inline-block");
                                                        time = new Date(scheduled);
                                                        now = new Date();
                                                        if ((time.getTime() - now.getTime()) <= 300000) this.innerHTML = labels.get("now");
                                                        else this.innerHTML = time.toLocaleTimeString().replace(/:\d\d /, ' ');
                                                }
                                                else{
                                                         this.setAttribute("style", "display:none");
                                                }
                                        },
                                        setAvatar : function setAvatar(id){
                                                var frag, ui;
                                                this.setAttribute("style", "background:none;");
                                                frag = document.createDocumentFragment();
                                                ui = new Avatar([id]);
                                                ui.place(frag);
                                                (!this.hasChildNodes())?this.appendChild(frag):this.replaceChild(frag, this.firstChild);
                                        },
                                        setIntro : function(intro){
                                                (intro) ? this.innerHTML = intro : this.innerHTML= " ";
                                        },
                                        showJoinButton : function(status){
                                                muPreviewUI.displayJoinButton(this, status, muCDB.get("participants"));
                                        },
                                        updateJoinButton : function(parts){
                                                var node =this;
                                                // update store for list UI
                                                participants.reset(parts);
                                                muPreviewUI.displayJoinButton(node, muCDB.get("status"), parts);
                                        },
                                        displayCancel : function(leader){
                                                (leader.id === user.get("_id")) ? this.innerHTML = '&#10007' : this.innerHTML = "";
                                        }
                                }),
                                "participant" : new Model(participants, {
                                        setAvatar : function setAvatar(id){
                                                var frag, ui;
                                                this.setAttribute("style", "background:none;");
                                                
                                                if (id){
                                                        frag = document.createDocumentFragment();
                                                        ui = new Avatar([id]);
                                                        ui.place(frag);
                                                        (!this.hasChildNodes())?this.appendChild(frag):this.replaceChild(frag, this.firstChild);
                                                }
                                        },
                                        setIntro : function(intro){
                                                (intro) ? this.innerHTML = intro : this.innerHTML= " ";
                                        },
                                        showCancel : function(id){
                                                (id === user.get('_id')) ? this.classList.remove("invisible") : this.classList.add("invisible");        
                                        }
                                }),
                                "info" : new Model(info, {
                                        showMsg : function(msg){
                                                if (msg){
                                                        this.innerHTML = msg;
                                                        this.classList.remove("invisible");        
                                                }
                                                else{
                                                        this.classList.add("invisible");
                                                        this.innerHTML = "";
                                                }
                                        }
                                }),
                                "previewevent" : new Event(muPreviewUI)      
                        });
                        
                        muPreviewUI.template = '<div id="mupreview" class="invisible"><div class="cache"></div><div class="contentarea"><div class="close" data-previewevent="listen:mousedown, closePreview"></div><div class="mubwait-title" name="title" data-model="bind:setTitle, title"></div><div class="datetime invisible" data-model="bind:showDate, scheduled"><div class="date" data-model="bind: setDate, scheduled"></div><div class="time" data-model="bind:setTime, scheduled"></div><div class="cancelsession" data-model = "bind: displayCancel, initiator" data-previewevent="listen: mousedown, cancelSession">&#10007</div></div><div class="mubdesc"><label data-labels="bind:innerHTML, quickstepstart"></label><p name="description" data-model="bind:setDescription, description"></p></div><div class="mubroster"><label data-labels="bind:innerHTML, participants">Participants</label><div class="mubleader contact"><div data-model="bind:setAvatar, initiator.id"></div><p class="contact-name" data-model="bind:innerHTML, initiator.username"></p><p class="contact-intro" data-model="bind:setIntro, initiator.intro"></p></div><ul class="participants" data-participant="foreach"><li class="contact"><div data-participant="bind:setAvatar, id"></div><p class="contact-name" data-participant="bind:innerHTML, username"></p><p class="contact-intro" data-participant="bind:setIntro, intro"></p><div class="cancelsession cancelpart invisible" data-participant="bind:showCancel, id" data-previewevent="listen: mousedown, cancelPart">&#10007</div></li></ul></div><div class="start-button invisible" data-model="bind:showJoinButton, status; bind: updateJoinButton, participants" data-previewevent="listen: mousedown, press; listen:mouseup, action"></div><div class="infopreview invisible" data-info="bind:showMsg, msg"></div></div></div>';
                       
                        muPreviewUI.reset = function reset(sid){
                                muPreviewUI.dom.classList.remove("invisible");
                                
                                muCDB.sync(Config.get("db"), sid).then(function(){
                                        participants.reset(muCDB.get("participants").concat());
                                }) ;
                        };
                        
                        muPreviewUI.closePreview = function closePreview(event, node){
                                // hide window
                                muPreviewUI.dom.classList.add("invisible");
                                muCDB.unsync();
                                muCDB.reset({});
                                refreshList();               
                        };
                        
                        muPreviewUI.press = function press(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        muPreviewUI.notify = function notify(type){
                                var json = {}, now = new Date(), date, dest, leader = muCDB.get("initiator").id, parts = muCDB.get("participants") || [], partIds = [];
                                
                                date = [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
                                
                                // set common parameters
                                json = {
                                        "status" : "unread",
                                        "date" : date,
                                        "author" : user.get("_id"),
                                        "username" : user.get("username"),
                                        "firstname" : user.get("firstname"),
                                        "toList" : "",
                                        "ccList" : "",
                                        "object" : "",
                                        "body" : "",
                                        "signature" : "",
                                        "docId" : muCDB.get("_id"),
                                        "docTitle" : muCDB.get("title"),
                                        "scheduled" : muCDB.get("scheduled")        
                                };
                                
                                for (i=0; i<parts.length; i++){
                                        partIds.push(parts[i].id);
                                }
                                
                                // new participant / cancel participant / cancel session
                                
                                switch(type){
                                        case "newpart":
                                                json.type = "MUP+";
                                                json.dest = [leader].concat(partIds);
                                                break;
                                        case "partleave":
                                                json.type = "MUP-";
                                                json.dest = [leader].concat(partIds);
                                                break;
                                        case "cancel":
                                                json.type = "SCANCEL";
                                                json.dest = partIds;
                                                break;
                                        case "start":
                                                json.type = "SSTART";
                                                json.dest = partIds;
                                                break;
                                        default:
                                                break;
                                }
                                
                                console.log("before request : ", json);
                                
                                transport.request("Notify", json, function(result){
                                        console.log(result);
                                });
                        };
                        
                        muPreviewUI.action = function action(event, node){
                                var action = node.getAttribute("name"),
                                      parts = muCDB.get("participants").concat() || [];
                                      
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                                spinner.spin(node.parentNode);
                                
                                switch (action){
                                        case "open":
                                                // change session status to "waiting"
                                                if (muCDB.get("initiator").id === user.get('_id')){
                                                        muCDB.set("status", "waiting");
                                                        muCDB.upload()
                                                        .then(function(){
                                                                // if scheduled, notify participants session is starting
                                                                if (muCDB.get("scheduled")) muPreviewUI.notify("start");
                                                                muPreviewUI.enter();
                                                        });
                                                }
                                                else{
                                                        console.log("Error : operation not permitted for ", user.get("_id"));
                                                }
                                                break;
                                        case "enter":
                                                if (parts.indexOf(user.get("_id")) > -1){
                                                        muPreviewUI.enter();
                                                }
                                                else{
                                                        console.log("Error: operation not permitted for ", user.get('_id'));
                                                }
                                                break;
                                        case "join":
                                                if (parts.indexOf(user.get('_id')) > -1 || (parts.length >= 3)){
                                                        console.log("Error session already full and/or user already a participant");
                                                }
                                                else{
                                                        parts.push({id:user.get("_id"), intro:user.get("intro"), username:user.get("username")});
                                                        muCDB.set("participants", parts);
                                                        muCDB.upload()
                                                        .then(function(){
                                                                // reset participants model
                                                                participants.reset(muCDB.get("participants"));
                                                                // notify leader and other participants
                                                                
                                                                // if it is a scheduled session notify leader and other participants
                                                                if (muCDB.get("scheduled")) muPreviewUI.notify("newpart");
                                                                
                                                                // if it is an immediate session and/or status === waiting join right away
                                                                if (muCDB.get("status") === "waiting") muPreviewUI.enter();
                                                                else spinner.stop();
                                                        });
                                                }
                                                break;  
                                        default:
                                                break;      
                                };
                        };
                        
                        muPreviewUI.enter = function enter(){
                                Config.get("observer").notify("join-musession", muCDB.get("_id"));
                                setTimeout(function(){
                                        spinner.stop();
                                        muPreviewUI.dom.classList.add("invisible");
                                        muCDB.unsync();
                                        muCDB.reset();
                                }, 3000);        
                        };
                        
                        muPreviewUI.init = function init(callback){
                                refreshList = callback;        
                        };
                        
                        muPreviewUI.displayJoinButton = function(node, status, parts){
                                var usr = user.get("_id"),
                                      leader = muCDB.get("initiator").id,
                                      sched = muCDB.get("scheduled") || 0;
                                      now = new Date().getTime();
                               
                               if (sched) sched = new Date(sched).getTime(); 
                                 
                                 // reset name attribute (used to trigger appropriate action)
                                if (node.hasAttribute("name")) node.removeAttribute("name");
                                
                                // if session is in progress display a message (it currently should not appear in any list)               
                                if (status === "in progress") info.set("msg", labels.get("sessionstarted"));
                                
                                // if session is in progress display a message (it currently should not appear in any list) 
                                else if (status === "deleted"){
                                        info.set("msg", labels.get("sessiondeleted"));
                                        muCDB.unsync();
                                }
                                
                                // other cases
                                else {
                                        // if current user is the session's initiator, he can open the session up to 15 minutes before scheduled start
                                        if (leader === usr){
                                                if (status !== "waiting" && status !== 'scheduled') node.classList.add("invisible");
                                                else{
                                                        // allow leader to open waiting room 15 minutes before start
                                                        if ((sched - now) < 900000) {
                                                                node.innerHTML = labels.get("openbutton");
                                                                node.setAttribute("name", "open");
                                                                node.classList.remove("invisible");
                                                                info.set("msg", labels.get("opennow"));
                                                        }
                                                        else {
                                                                node.classList.add("invisible");
                                                                info.set("msg", labels.get("openfifteen"));
                                                        }
                                                }       
                                        }
                                        
                                        // else check if current user is already a participant
                                        else if (JSON.stringify(parts).search(usr) > -1){
                                                if (status === "waiting"){
                                                        node.innerHTML = labels.get("enterbutton");
                                                        node.setAttribute("name", "enter");
                                                        node.classList.remove("invisible");
                                                        info.set("msg", labels.get("enternow"));       
                                                }
                                                else {
                                                        node.classList.add("invisible");
                                                        info.set("msg", labels.get("enterfifteen"));
                                                }      
                                        }
                                        
                                        // if user has not yet opted to join the session he can do so if it is not already full
                                        else{
                                                if ((parts.length < 3) && ( (status === "scheduled") || (status === "waiting"))){
                                                        node.innerHTML = labels.get("joinbutton");
                                                        node.setAttribute("name", "join");
                                                        node.classList.remove("invisible");
                                                        info.set("msg", labels.get("joinnow"));
                                                }
                                                else {
                                                        node.classList.add("invisible");
                                                        info.set("msg", labels.get("sessionfull"));
                                                }
                                        }      
                                }            
                        };
                        
                        /*
                         *  Confirmation callback
                         */
                                
                        /*
                         *  Function called to cancel a scheduled session
                         */
                        muPreviewUI.cancelSession = function(event, node){
                                
                                // display confirmation UI
                                var confirmCallback = function(decision){
                                        if (decision){
                                                // remove session from database
                                                muCDB.set("status", 'deleted');
                                                muCDB.upload()
                                                .then(function(){
                                                        // notify registered participants
                                                        if (muCDB.get("participants").length) muPreviewUI.notify("cancel");
                                                        return muCDB.remove();        
                                                })
                                                .then(function(){
                                                       muPreviewUI.closePreview();
                                                });
                                        }
                                        Confirm.hide();
                                };
                                Confirm.reset(labels.get("delsession"), confirmCallback, "musession-confirm");
                                Confirm.show();
                        };
                        
                        /*
                         * A participant decides to leave a scheduled session
                         */
                        muPreviewUI.cancelPart = function(event, node){
                                var idx = node.getAttribute("data-participant_id"), parts = muCDB.get("participants").concat();
                                // display confirmation UI
                                var confirmCallback = function(decision){
                                        if (decision){
                                                // remove participant from participant store and session store
                                                participants.alter("splice", idx, 1);
                                                parts.splice(idx, 1);
                                                muCDB.set("participants", parts);
                                                muCDB.upload()
                                                .then(function(){
                                                        // notify participants
                                                        muPreviewUI.notify("partleave");      
                                                });
                                        }
                                        Confirm.hide();
                                };
                                Confirm.reset(labels.get("partcancel"), confirmCallback, "musession-confirm");
                                Confirm.show();    
                        };
                        
                        
                        return muPreviewUI;       
                };
        });