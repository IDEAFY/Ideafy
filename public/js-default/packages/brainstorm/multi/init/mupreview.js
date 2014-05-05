/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "CouchDBDocument", "Store", "Bind.plugin", "Event.plugin", "service/avatar", "service/utils", "lib/spin.min"],
        function(Widget, Config, CouchDBDocument, Store, Model, Event, Avatar, Utils, Spinner){
                
                return function MUPreviewConstructor(){
                        
                        var muPreviewUI = new Widget(),
                              labels = Config.get("labels"),
                              user = Config.get("user"),
                              muCDB =  new CouchDBDocument(),
                              info = new Store({"msg":""}),
                              participants = new Store([]),
                              spinner = new Spinner({color:"#5F8F28", lines:10, length: 10, width: 6, radius:10, left: 269, top: 306}).spin(),
                              refreshList; // callback function when closing the preview window
                        
                        muCDB.setTransport(Config.get("transport"));
                        
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
                                                        if (date.getDate() === now.getDate()) this.innerHTML = labels.get("today");
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
                                                // update store for list UI
                                                participants.reset(parts);
                                                muPreviewUI.displayJoinButton(this, muCDB.get("status"), parts);
                                        }
                                }),
                                "participant" : new Model(participants, {
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
                        
                        muPreviewUI.template = '<div id="mupreview" class="invisible"><div class="cache"></div><div class="contentarea"><div class="close" data-previewevent="listen:mousedown, closePreview"></div><div class="mubwait-title" name="title" data-model="bind:setTitle, title"></div><div class="datetime invisible" data-model="bind:showDate, scheduled"><div class="date" data-model="bind: setDate, scheduled"></div><div class="time" data-model="bind:setTime, scheduled"></div></div><div class="mubdesc"><label data-labels="bind:innerHTML, quickstepstart"></label><p name="description" data-model="bind:setDescription, description"></p></div><div class="mubroster"><label data-labels="bind:innerHTML, participants">Participants</label><div class="mubleader contact"><div data-model="bind:setAvatar, initiator.id"></div><p class="contact-name" data-model="bind:innerHTML, initiator.username"></p><p class="contact-intro" data-model="bind:setIntro, initiator.intro"></p></div><ul class="participants" data-participant="foreach"><li class="contact"><div data-participant="bind:setAvatar, id"></div><p class="contact-name" data-participant="bind:innerHTML, username"></p><p class="contact-intro" data-participant="bind:setIntro, intro"></p></li></ul></div><div class="start-button invisible" data-model="bind:showJoinButton, status; bind: updateJoinButton, participants" data-previewevent="listen: mousedown, press; listen:mouseup, action"></div><div class="infopreview invisible" data-info="bind:showMsg, msg"></div></div></div>';
                       
                        muPreviewUI.reset = function reset(sid){
                                document.getElementById("mupreview").classList.remove("invisible");
                                muCDB.sync(Config.get("db"), sid).then(function(){
                                        participants.reset(muCDB.get("participants"));
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
                                                                muPreviewUI.join();         
                                                        });
                                                }
                                                else{
                                                        console.log("Error : operation not permitted for ", user.get("_id"));
                                                }
                                                break;
                                        case "enter":
                                                if (parts.indexOf(user.get("_id")) > -1){
                                                        muPreviewUI.join();
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
                                                        parts.push(user.get("_id"));
                                                        muCDB.set("participants", parts);
                                                        muCDB.upload()
                                                        .then(function(){
                                                                muPreviewUI.join();         
                                                        });
                                                }
                                                break;  
                                        default:
                                                break;      
                                };
                        };
                        
                        muPreviewUI.join = function join(){
                                Config.get("observer").notify("join-musession", muCDB.get("_id"));
                                setTimeout(function(){
                                        spinner.stop();
                                        muPreviewUI.dom.classList.add("invisible");
                                        muCDB.unsync();
                                        muCDB.reset();
                                }, 5000);        
                        };
                        
                        muPreviewUI.init = function init(callback){
                                refreshList = callback;        
                        };
                        
                        muPreviewUI.displayJoinButton = function(node, status, parts){
                                var usr = user.get("_id"),
                                      leader = muCDB.get("initiator").id,
                                      sched = muCDB.get("scheduled") || 0;
                                      now = new Date().getTime(), sched = new Date(sched).getTime(); 
                                 
                                 console.log(status, parts);
                                      
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
                                                if (status !== "scheduled") node.classList.add("invisible");
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
                                        else if (parts.indexOf(usr) > -1){
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
                                                if (parts.length < 3 && ( status === "scheduled" || status === "waiting")){
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
                        
                        return muPreviewUI;       
                };
        });