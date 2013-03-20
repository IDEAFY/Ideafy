/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "service/config", "Promise", "Store"],
        function(Widget, Model, Event, CouchDBStore, Config, Promise, Store){
                
           return function NewMUBConstructor($exit, $join){
           
                var widget = new Widget(),
                    session = new Store({}),
                    contactList = new Store([]),
                    invited = new Store([]),
                    error = new Store({"errormsg":""}),
                    labels= Config.get("labels"),
                    user = Config.get("user");
                
                widget.plugins.addAll({
                        "labels": new Model(labels),
                        "newmub": new Model(session, {
                                initSessionMode : function(mode){
                                        switch(mode){
                                                case "campfire":
                                                        this.selectedIndex = 1;
                                                        break;
                                                case "boardroom":
                                                        this.selectedIndex = 2;
                                                        break;
                                                default:
                                                        this.selectedIndex= 0;
                                        }        
                                },
                                setSessionInfo : function(mode){
                                        switch(mode){
                                                case "campfire":
                                                        this.innerHTML = labels.get("campfireinfo");
                                                        break;
                                                case "boardroom":
                                                        this.innerHTML = labels.get("boardroominfo");
                                                        break;
                                                default:
                                                        this.innerHTML = labels.get("rouletteinfo");
                                                        break;
                                        }
                                },
                                displayInvitations : function(mode){
                                        if (mode === "boardroom"){
                                                this.classList.remove("invisible");
                                        }
                                        else{
                                                this.classList.add("invisible");
                                        }
                                },
                                setTitle : function(initiator){
                                        var _now = new Date();
                                        if (initiator && initiator.username) {
                                                this.setAttribute("placeholder", labels.get("quickstarttitleplaceholderpre")+initiator.username+labels.get("quickstarttitleplaceholderpost"));
                                        }
                                }
                        }),
                        "auto" : new Model(contactList, {
                                        highlight : function(selected){
                                                (selected)? this.classList.add("selected") : this.classList.remove("selected");
                                        }
                        }),
                        "invited" : new Model(invited,{
                                setSelected : function(selected){
                                                (selected)? this.innerHTML = "&#10003;":this.innerHTML="";
                                }
                        }),
                        "errormsg": new Model(error),
                        "newmubevent": new Event(widget)
                });
                
                widget.template = '<div id="newmub"><div id="newmub-content"><form><label>Select mode</label><hr/><div class="select-mode"><select data-newmub="bind:initSessionMode, mode" data-newmubevent="listen:change, changeSessionMode"><option name="roulette" data-labels="bind:innerHTML, roulette"></option><option name="campfire" data-labels="bind:innerHTML, campfire"></option><option name="boardroom" data-labels="bind:innerHTML, boardroom"></option></select><span class="session-info" data-newmub="bind: setSessionInfo, mode"></span></div><div class="invite-contacts invisible" data-newmub="bind:displayInvitations, mode"><label>Invite your contacts</label><hr/><div class="selectall" data-labels="bind:innerHTML, selectall" data-newmubevent="listen: touchstart, press; listen:touchend, selectAll">Select all</div><input class="search" data-newmubevent="listen:touchstart, displayAutoContact; listen:input, updateAutoContact" data-labels="bind:placeholder, tocontactlbl"><div id="invitelistauto" class="autocontact invisible"><div class="autoclose" data-newmubevent="listen:touchstart,close"></div><ul data-auto="foreach"><li data-auto="bind:innerHTML, username; bind:highlight, selected" data-newmubevent="listen:touchend, select"></li></ul></div><div class="invitecontactlist"><ul data-invited="foreach"><li class = "contact list-item" data-newmubevent="listen:touchstart, discardContact"><p class="contact-name" data-invited="bind:innerHTML, username"></p><div class="remove-contact"></div></li></ul></div></div><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="session-title" readonly="readonly" name="title" data-newmub="bind:value, title; bind: setTitle, initiator" data-newmubevent="listen: touchstart, removeReadonly"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="session-desc" name="description" data-newmub="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea></form><div class="newmub-footer"><p class="send"><label class="clear" data-labels="bind:innerHTML, clear" data-newmubevent="listen: touchstart, press; listen:touchend, clear">Clear</label><label class="create" data-labels="bind:innerHTML, create" data-newmubevent="listen:touchstart, press; listen:touchend, create">Create</label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p></div></div></div>';
                
                widget.place(document.getElementById("newmub"));
                
                widget.reset = function reset(){
                        var sessionTemplate = {"title" : "",
                                "description" : "",
                                "initiator" : {
                                        "id" : user.get("_id"),
                                        "username" : user.get("username"),
                                        "picture_file" : user.get("picture_file")
                                },
                                "participants" : [],
                                "date" : [],
                                "startTime" : null,
                                "resumeTime" : null,
                                "duration" : null,
                                "elapsedTime" : 0,
                                "elapsedTimers" : {},
                                "mode" : "roulette",
                                "type" : 8,
                                "deck" : user.get("active_deck"),
                                "status" : "waiting",
                                "step" : "",
                                "lang" : user.get("lang"),
                                "characters" : [],
                                "contexts" : [],
                                "problems" : [],
                                "scenarioWB" : [],
                                "scenario" : [], //{"title" : "", "story" : "", "solution" : ""}
                                "techno" : [[]],
                                "ideaWB" : [],
                                "idea" : [], //{"title" : "", "description" : "", "solution" : "", "visibility" : "private", "id" : "" }
                                "score" : "",
                                "chat" : [],
                                "invited": []};
                        session.reset(sessionTemplate);    
                };
                
                widget.changeSessionMode = function(event, node){
                        var id = node.selectedIndex,
                            opt = node.childNodes[id],
                            name = opt.getAttribute("name");
                        
                        contactList.reset(user.get("connections"));
                        invited.reset([]);
                        session.set("mode", name);
                };
                
                widget.displayAutoContact = function(event, node){
                                document.getElementById("invitelistauto").classList.remove('invisible');
                                // reset contactList with all user connections
                                contactList.reset(user.get("connections"));       
                };
                
                widget.updateAutoContact = function(event, node){
                                var arr = JSON.parse(contactList.toJSON()), connections = user.get("connections"), 
                                    clc, vlc = node.value.toLowerCase(); // lowercase conversion
                                
                                if (node.value === ""){
                                        //initialize contact list with allcontacts in user's document
                                        contactList.reset(connections);
                                }
                                else{
                                        for (i=arr.length-1; i>=0; i--){
                                                clc = arr[i].username.toLowerCase();
                                                if (clc.search(vlc) !== 0) arr.splice(i, 1);
                                        }
                                        contactList.reset(arr);    
                                }
                                // check if items are present in the group and set selected status accordingly
                                contactList.loop(function(v,i){
                                        if(invited.toJSON().search(v.contact.userid) >-1) contactList.update(i, "selected", true);        
                                });
                };
                        
                widget.close = function close(event, node){
                        node.parentNode.classList.add("invisible");         
                };
                
                widget.discardContact = function(event,node){
                        var id = node.getAttribute("data-contacts_id"),
                            userid = invited.get(id).userid;
                        invited.alter("splice", id, 1);
                        contactList.loop(function(v,i){
                                if (v.userid === userid) setTimeout(function(){contactList.update(i, "selected", false);}, 200);
                        });
                        // unselect group if applicable
                        widget.unselectGroup(userid);      
                 };
                
                 widget.select = function(event, node){
                        var id = node.getAttribute("data-auto_id");
                        if (contactList.get(id).selected){
                                widget.removeContact(contactList.get(id));
                                setTimeout(function(){
                                        contactList.update(id, "selected", false);
                                        document.getElementById("invitelistauto").classList.add("invisible");
                                }, 200);
                        }
                        else {
                                widget.addContact(contactList.get(id));
                                widget.selectGroup();
                                setTimeout(function(){
                                        contactList.update(id, "selected", true);
                                        document.getElementById("invitelistauto").classList.add("invisible");
                                }, 200);        
                        }
                };
                        
                widget.selectAll = function(event, node){
                        node.classList.remove("pressed");
                        invited.reset([]); // to avoid duplicates
                        contactList.reset(user.get("connections"));
                        contactList.loop(function(v, i){
                                contactList.update(i, "selected", true);
                                if (v.type === "user") invited.alter("push", v)        
                        });  
                };
                        
                widget.removeContact = function(contact){
                        if (contact.type === "group"){
                                for (j=contact.contacts.length-1; j>=0; j--){
                                        widget.removeContact(contact.contacts[j]);
                                }        
                        }
                        else{
                                invited.loop(function(v,i){
                                        if (v.userid === contact.userid) invited.alter("splice", i, 1);        
                                });
                                // unselect group if applicable
                                widget.unselectGroup(contact.userid);
                                // unselect contact
                                contactList.loop(function(val, idx){
                                        if (val.userid === contact.userid) contactList.update(idx, "selected", false);        
                                });
                       }
                };
                        
                widget.selectGroup = function(){
                        var cts, add = false;
                        // check unselected groups
                        contactList.loop(function(v,i){
                                if (v.type === "group" && !v.selected){
                                        cts = v.contacts;
                                        add = true;
                                        for (j=cts.length-1;j>=0; j--){
                                                if (invited.toJSON().search(cts[j].userid)<0){
                                                        add = false;
                                                        break;
                                                }
                                         }
                                        if (add) contactList.update(i, "selected", true);
                                }        
                        });  
                };
                        
                widget.unselectGroup = function(userid){
                        // first loop through all selected groups
                        contactList.loop(function(v,i){
                                if (v.type === "group" && v.selected){
                                        if (JSON.stringify(v.contacts).search(userid)>0) contactList.update(i, "selected", false);
                                }       
                        }); 
                };
                        
                widget.addContact = function(contact){
                        var i, l, add=true;
                        if (contact.type === "user") invited.alter("push", contact)
                        else{
                                for(i=0, l=contact.contacts.length; i<l; i++){
                                        invited.loop(function(val,idx){
                                                        if (val.userid === contact.contacts[i].userid) add = false                
                                        });
                                        if (add) {
                                                invited.alter("push", contact.contacts[i]);
                                                contactList.loop(function(val,idx){
                                                        if (val.userid === contact.contacts[i].userid) contactList.update(idx, "selected", true);
                                                }); 
                                        }
                                }       
                        }       
                };
                
                widget.removeReadonly = function(event, node){
                        node.removeAttribute("readonly");        
                };
                
                widget.press = function(event, node){
                        node.classList.add("pressed");        
                };
                
                widget.clear = function(event, node){
                        node.classList.remove("pressed");
                        widget.reset();        
                };
                
                widget.create = function(event, node){
                        node.classList.remove("pressed");
                        widget.uploadSession();       
                };
                
                widget.uploadSession = function uploadSession(){
                        // add invitees to session document
                        var cdb = new CouchDBStore(),
                            now = new Date();
                                                
                        // complete session doc
                        session.set("date", [now.getFullYear(), now.getMonth(), now.getDate()]);
                        invited.loop(function(v,i){
                                session.get("invited").push(v);        
                        });
                        if (session.get("title") === ""){
                                session.set("title", labels.get("quickstarttitleplaceholderpre")+session.get("initiator").username+labels.get("quickstarttitleplaceholderpost"));      
                        }
                        session.set("_id", "S:MU:"+now.getTime());
                        
                        cdb.reset(JSON.parse(session.toJSON()));
                        console.log(cdb.toJSON());
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(Config.get("db"), cdb.get("_id"));
                        setTimeout(function(){
                                cdb.upload();
                                console.log(cdb.toJSON());
                                console.log("should notify invitees and initiate waiting room");
                                $join(cdb.get("_id"));
                                cdb.unsync();
                                widget.reset();
                        }, 250);
                };
                
                // init
                widget.reset();
                
                return widget;
                   
           };
});