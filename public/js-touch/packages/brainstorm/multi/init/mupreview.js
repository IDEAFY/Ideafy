/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBStore", "Store", "Bind.plugin", "Event.plugin", "service/avatar", "service/utils"],
        function(Widget, Config, CouchDBStore, Store, Model, Event, Avatar, Utils){
                
                return function MUPreviewConstructor(){
                        
                        var muPreviewUI = new Widget(),
                            labels = Config.get("labels"),
                            muCDB =  new CouchDBStore(),
                            participants = new Store([]),
                            refreshList; // callback function when closing th epreview window
                        
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
                                                this.innerHTML = desc;
                                                if (user.get("_id") === session.get("initiator").id){
                                                        this.setAttribute("contenteditable", true);
                                                }
                                                else {
                                                        this.setAttribute("contenteditable", false);        
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
                                        showStartButton : function(participants){
                                                if (participants.length && user.get("_id") === session.get("initiator").id){
                                                        this.classList.remove("invisible");
                                                }
                                                else{
                                                        this.claddLit.add("invisible");
                                                }
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
                                "info": new Model(info),
                                "previewevent" : new Event(muPreviewUI)      
                        });
                        
                        muPreviewUI.template = '<div id="mupreview" class="invisible"><div class="cache"></div><div class="contentarea"><div class="close" data-previewevent="listen:touchstart, closePreview"></div><div class="mubwait-title" name="title" data-model="bind:setTitle, title" data-mubwaitevent="listen: keypress, checkUpdate; listen:blur, updateField"></div><div class="mubdesc"><label data-labels="bind:innerHTML, quickstepstart"></label><p name="description" data-model="bind:setDescription, description" data-mubwaitevent="listen: keypress, checkUpdate; listen:blur, updateField"></p></div><div class="mubroster"><label data-labels="bind:innerHTML, participants">Participants</label><div class="mubleader contact"><div data-model="bind:setAvatar, initiator.id"></div><p class="contact-name" data-model="bind:innerHTML, initiator.username"></p><p class="contact-intro" data-model="bind:setIntro, initiator.intro"></p></div><ul class="participants" data-participant="foreach"><li class="contact"><div data-participant="bind:setAvatar, id"></div><p class="contact-name" data-participant="bind:innerHTML, username"></p><p class="contact-intro" data-participant="bind:setIntro, intro"></p></li></ul></div><div class="start-button" data-labels="bind:innerHTML, joinbutton" data-previewevent="listen: touchstart, press; listen:touchend, start"></div></div></div>';
                       
                        muPreviewUI.reset = function reset(sid){
                                console.log(sid);
                                document.getElementById("mupreview").classList.remove("invisible");
                                muCDB.sync(Config.get("db"), sid).then(function(){
                                        participants.reset(muCDB.get("participants"));
                                }) ;
                        };
                        
                        muPreviewUI.closePreview = function closePreview(event, node){
                                // hide window
                                document.getElementById("mupreview").classList.add("invisible");
                                muCDB.unsync();
                                muCDB.reset();
                                refreshList();               
                        };
                        
                        muPreviewUI.init = function init(callback){
                                refreshList = callback;        
                        };
                        MUPUI = muPreviewUI;
                                              
                        return muPreviewUI;       
                };
        });