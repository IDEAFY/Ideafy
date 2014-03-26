/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBDocument", "Store", "Bind.plugin", "Event.plugin", "service/avatar", "service/utils", "lib/spin.min"],
        function(Widget, Config, CouchDBDocument, Store, Model, Event, Avatar, Utils, Spinner){
                
                return function MUPreviewConstructor(){
                        
                        var muPreviewUI = new Widget(),
                            labels = Config.get("labels"),
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
                                                        date = new Date(scheduled);
                                                        now = new Date();
                                                        if (date.getDate() === now.getDate()) this.innerHTML = labels.get("today");
                                                        else this.innerHTML = date.toLocaleDateString();
                                                }        
                                        },
                                        setTime : function(scheduled){
                                                var time, now;
                                                if (scheduled){
                                                        time = new Date(scheduled);
                                                        now = new Date();
                                                        if ((time.getTime() - now.getTime()) <= 300000) this.innerHTML = labels.get("now");
                                                        else this.innerHTML = time.toLocaleTimeString();
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
                                "info" : new Model(info),
                                "previewevent" : new Event(muPreviewUI)      
                        });
                        
                        muPreviewUI.template = '<div id="mupreview" class="invisible"><div class="cache"></div><div class="contentarea"><div class="close" data-previewevent="listen:mousedown, closePreview"></div><div class="mubwait-title" name="title" data-model="bind:setTitle, title"></div><div class="datetime" data-model="bind:showDate, scheduled"><div class="date" data-model="bind: setDate, scheduled"></div><div class="time" data-model="bind:setTime, scheduled"></div></div><div class="mubdesc"><label data-labels="bind:innerHTML, quickstepstart"></label><p name="description" data-model="bind:setDescription, description"></p></div><div class="mubroster"><label data-labels="bind:innerHTML, participants">Participants</label><div class="mubleader contact"><div data-model="bind:setAvatar, initiator.id"></div><p class="contact-name" data-model="bind:innerHTML, initiator.username"></p><p class="contact-intro" data-model="bind:setIntro, initiator.intro"></p></div><ul class="participants" data-participant="foreach"><li class="contact"><div data-participant="bind:setAvatar, id"></div><p class="contact-name" data-participant="bind:innerHTML, username"></p><p class="contact-intro" data-participant="bind:setIntro, intro"></p></li></ul></div><div class="start-button" data-labels="bind:innerHTML, joinbutton" data-previewevent="listen: mousedown, press; listen:mouseup, join"></div><div class="infopreview invisible" data-info="bind:innerHTML, msg"></div></div></div>';
                       
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
                                muCDB.reset();
                                refreshList();               
                        };
                        
                        muPreviewUI.press = function press(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        muPreviewUI.join = function join(event, node){
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                                spinner.spin(node.parentNode);
                                Config.get("observer").notify("join-musession", muCDB.get("_id"));
                                setTimeout(function(){
                                        spinner.stop();
                                        muPreviewUI.dom.classList.add("invisible");
                                        muCDB.unsync();
                                        muCDB.reset();
                                }, 15000);
                        };
                        
                        muPreviewUI.init = function init(callback){
                                refreshList = callback;        
                        };
                        
                        // watch for new participants
                        muCDB.watchValue("participants", function(arr){
                                var mup = document.getElementById("mupreview"),
                                    join = mup.querySelector(".start-button"),
                                    inf = mup.querySelector(".infopreview");
                                participants.reset(arr);
                                if (arr.length < 3 && muCDB.get("status") === "waiting"){
                                        join.classList.remove("invisible");
                                        inf.classList.add("invisible");
                                }
                                else {
                                        if (arr.length === 3 && muCDB.get("status") === "waiting"){
                                                info.set("msg", labels.get("sessionfull"));
                                        }
                                        join.classList.add("invisible");
                                        inf.classList.remove("invisible");
                                }
                        });
                        
                        // watch for status changes
                        muCDB.watchValue("status", function(value){
                                var mup = document.getElementById("mupreview"),
                                    join = mup.querySelector(".start-button"),
                                    inf = mup.querySelector(".infopreview");
                                if (value === "waiting" && muCDB.get("participants").length < 3){
                                        join.classList.remove("invisible");
                                        inf.classList.add("invisible");        
                                }
                                else{
                                        if (muCDB.get("participants").length === 3 && value === "waiting"){
                                                info.set("msg", labels.get("sessionfull"));
                                        }
                                        if (value === "in progress"){
                                                info.set("msg", labels.get("sessionstarted"));
                                                muCDB.unsync();
                                        }
                                        if (value === "deleted"){
                                                info.set("msg", labels.get("sessiondeleted"));
                                                muCDB.unsync();        
                                        }
                                        join.classList.add("invisible");
                                        inf.classList.remove("invisible");        
                                }
                        });
                        
                        SPIP = spinner;
                        return muPreviewUI;       
                };
        });