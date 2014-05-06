/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "Bind.plugin", "Event.plugin", "CouchDBDocument", "service/config", "Promise", "Store", "service/utils", "lib/spin.min", "Place.plugin", "service/date", "service/time"],
        function(Widget, Model, Event, CouchDBDocument, Config, Promise, Store, Utils, Spinner, Place, DateWidget, TimeWidget){
                
           return function NewMUBConstructor($exit){
           
                var widget = new Widget(),
                    session = new Store({}),
                    contactList = new Store([]),
                    invited = new Store([]),
                    error = new Store({"errormsg":""}),
                    labels= Config.get("labels"),
                    user = Config.get("user"),
                    _languages = new Store(Config.get("userLanguages")),
                    _resetLang = function(){
                        // set language to the user's language by default
                                var l = user.get("lang").substring(0,2);
                                session.set("lang", l);
                                _languages.loop(function(v,i){
                                        (v.name === l) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);       
                                });        
                    },
                    sessionTemplate = {"title" : "",
                         "description" : "",
                         "initiator" : {
                                "id" : user.get("_id"),
                                "username" : user.get("username"),
                                "intro" : user.get("intro")
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
                        "step" : "mustart",
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
                        "invited": [],
                        "scheduled":null},
                        dateUI = new DateWidget(),
                        timeUI = new TimeWidget(),
                        spinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -8, left: 680}).spin();
                
                // reset languages
                _resetLang();
                
                widget.plugins.addAll({
                        "labels": new Model(labels),
                        "newmub": new Model(session, {
                                initSessionMode : function(mode){
                                        switch(mode){
                                                case "campfire":
                                                        this.selectedIndex = 1;
                                                        this.setAttribute("style", "color: #F27B3D;");
                                                        break;
                                                case "boardroom":
                                                        this.selectedIndex = 2;
                                                        this.setAttribute("style", "color: #4D4D4D;");
                                                        break;
                                                default:
                                                        this.selectedIndex= 0;
                                                        this.setAttribute("style", "color: #5F8F28;");
                                                        break;
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
                                },
                                displayLang : function(lang){
                                        var l=lang.substring(0,2);
                                        this.setAttribute("style", "background-image:url('img/flags/"+l+".png');");       
                                }
                        }),
                        "select" : new Model (_languages, {
                                setBg : function(name){
                                        this.setAttribute("style", "background-image:url('img/flags/"+name+".png');");
                                },
                                setSelected : function(selected){
                                        (selected) ? this.classList.add("selected") : this.classList.remove("selected");        
                                } 
                        }),
                        "auto" : new Model(contactList, {
                                        highlight : function(selected){
                                                (selected)? this.classList.add("selected") : this.classList.remove("selected");
                                        }
                        }),
                        "place" : new Place({"dateUI": dateUI, "timeUI": timeUI}),
                        "invited" : new Model(invited,{
                                setSelected : function(selected){
                                                (selected)? this.innerHTML = "&#10003;":this.innerHTML="";
                                }
                        }),
                        "errormsg": new Model(error),
                        "newmubevent": new Event(widget)
                });
                
                widget.template = '<div id="newmub"><div id="newmub-content"><form><div class="idealang"><div class="currentlang" data-newmub="bind: displayLang, lang" data-newmubevent="listen: mouseup, showLang"></div><ul class="invisible" data-select="foreach"><li data-select="bind: setBg, name; bind: setSelected, selected" data-newmubevent="listen: mousedown, selectFlag; listen: mouseup, setLang"></li></ul></div><label data-labels="bind:innerHTML, selectmode"></label><hr/><div class="select-mode"><select data-newmub="bind:initSessionMode, mode" data-newmubevent="listen:change, changeSessionMode"><option name="roulette" data-labels="bind:innerHTML, roulette"></option><option name="campfire" data-labels="bind:innerHTML, campfire"></option><option name="boardroom" data-labels="bind:innerHTML, boardroom"></option></select><span class="session-info" data-newmub="bind: setSessionInfo, mode"></span></div><div class="schedule-session"><label data-labels="bind:innerHTML, schedulesession"></label><hr/><input type="radio" name="schedule" checked=true data-newmubevent="listen:click, hideDTUI"><span data-labels="bind:innerHTML, now"></span><input type="radio" name="schedule" data-newmubevent="listen: click, showDTUI"><span data-labels="bind:innerHTML, schedule"></span><br/><div class="dateandtime invisible"><div data-place="place: dateUI"></div><div data-place="place:timeUI"></div></div></div><div class="invite-contacts invisible" data-newmub="bind:displayInvitations, mode"><label>Invitez les participants</label><hr/><div class="selectall" data-labels="bind:innerHTML, selectall" data-newmubevent="listen: mousedown, press; listen:mouseup, selectAll">Select all</div><input class="search" data-newmubevent="listen:mousedown, displayAutoContact; listen:input, updateAutoContact" data-labels="bind:placeholder, tocontactlbl"><div id="invitelistauto" class="autocontact invisible"><div class="autoclose" data-newmubevent="listen:mousedown,close"></div><ul data-auto="foreach"><li data-auto="bind:innerHTML, username; bind:highlight, selected" data-newmubevent="listen:mouseup, select"></li></ul></div><div class="invitecontactlist"><ul data-invited="foreach"><li class = "contact list-item" data-newmubevent="listen:mousedown, discardContact"><p class="contact-name" data-invited="bind:innerHTML, username"></p><div class="remove-contact"></div></li></ul></div></div><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="session-title" maxlength=40 readonly="readonly" name="title" data-newmub="bind:value, title; bind: setTitle, initiator" data-newmubevent="listen: mousedown, removeReadonly"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="session-desc" name="description" data-newmub="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea></form><div class="newmub-footer"><p class="send"><label class="clear" data-labels="bind:innerHTML, clear" data-newmubevent="listen: mousedown, press; listen:mouseup, clear"></label><label class="create" data-labels="bind:innerHTML, create" data-newmubevent="listen:mousedown, press; listen:mouseup, create"></label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p></div></div></div>';
                
                widget.place(document.getElementById("newmub"));
                
                widget.reset = function reset(){
                        var sessionTemplate = {"title" : "",
                                "description" : "",
                                "initiator" : {
                                        "id" : user.get("_id"),
                                        "username" : user.get("username"),
                                        "intro" : user.get("intro")
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
                                "invited": [],
                                "scheduled":null};
                                
                        session.reset(sessionTemplate);
                        // update user data
                        session.set("lang", user.get("lang"));
                        session.set("deck", user.get("active_deck"));
                        session.set("initiator", {"id" : user.get("_id"), "username" : user.get("username"), "intro" : user.get("intro")});
                        
                        // reset scheduling, invitations, errors
                        widget.hideDTUI();
                        invited.reset([]);
                        error.set("errormsg", "");
                        // reset contactList with all user connections
                       contactList.reset(user.get("connections").concat());  
                };
                
                widget.showLang = function(event, node){
                        widget.dom.querySelector(".idealang ul").classList.remove("invisible");        
                };
                
                widget.selectFlag = function(event, node){
                        var id;
                        event.stopPropagation();
                        id = parseInt(node.getAttribute("data-select_id"), 10);
                        _languages.loop(function(v,i){
                                (id === i) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);
                        });                
                };
                        
                widget.setLang = function(event, node){
                        var id;
                        event.stopPropagation();
                        id = node.getAttribute("data-select_id");
                        session.set("lang", _languages.get(id).name);
                        widget.dom.querySelector(".idealang ul").classList.add("invisible");        
                };
                
                widget.changeSessionMode = function(event, node){
                        var id = node.selectedIndex,
                            opt = node.childNodes[id],
                            name = opt.getAttribute("name");
                        
                        contactList.reset(user.get("connections"));
                        invited.reset([]);
                        session.set("mode", name);
                };
                
                widget.showDTUI = function(event, node){
                        widget.dom.querySelector(".dateandtime").setAttribute("style", "display: inline-block;");
                };
                
                widget.hideDTUI = function(event, node){
                        widget.dom.querySelector(".dateandtime").setAttribute("style", "display: none;");
                        dateUI.reset();
                        timeUI.reset();     
                };
                
                widget.displayAutoContact = function(event, node){
                                document.getElementById("invitelistauto").classList.remove('invisible');
                                // reset contactList with all user connections
                                contactList.reset(user.get("connections").concat());       
                };
                
                widget.updateAutoContact = function(event, node){
                                var arr = JSON.parse(contactList.toJSON()), connections = user.get("connections").concat(), 
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
                        var id = node.getAttribute("data-invited_id"),
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
                                if (v.type === "user") {invited.alter("push", v);}        
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
                        if (contact.type === "user") invited.alter("push", contact);
                        else{
                                for(i=0, l=contact.contacts.length; i<l; i++){
                                        invited.loop(function(val,idx){
                                                        if (val.userid === contact.contacts[i].userid) add = false;                
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
                        error.set("errormsg", "");
                        if (session.get("title").length<3 || session.get("description").length<3){
                                error.set("errormsg", labels.get("providesessioninfo"));
                        }
                        else if (session.get("mode") !== "roulette" && user.get("connections").length < 1){
                                error.set("errormsg", labels.get("nofriendtoinvite"));
                        }
                        else if (session.get("mode") === "boardroom" && !invited.getNbItems()){
                                error.set("errormsg", labels.get("inviteatleastone"));        
                        }
                        else {
                                node.classList.add("invisible");
                                spinner.spin(node.parentNode);
                                widget.uploadSession().then(function(){
                                        spinner.stop();
                                        node.classList.remove("invisible");
                                        widget.reset();
                                });
                        }
                };
                
                widget.createChat = function createChat(id){
                        var cdb = new CouchDBDocument(),
                            now = new Date().getTime(),
                            promise = new Promise();
                        cdb.setTransport(Config.get("transport"));
                        
                        cdb.set("users", [{"username":user.get("username"), "userid": user.get("_id")}]);
                        cdb.set("msg", [{user: "SYS", "type": 0, "arg": 0, "time": now}]);
                        cdb.set("sid", session.get("_id"));
                        cdb.set("lang", session.get("lang"));
                        cdb.set("readonly", false); // once the step is cleared readonly is set to true
                        cdb.set("step", 0); // mubwait or mubstart will display the same chat
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
                
                widget.uploadSession = function uploadSession(){
                        // add invitees to session document
                        var cdb = new CouchDBDocument(),
                            now = new Date(),
                            scheduled,
                            chatId, chat = session.get("chat") || [],
                            promise = new Promise();
                        
                        // create doc id
                        session.set("_id", "S:MU:"+now.getTime());
                        
                        // complete session doc
                        
                        // check if session is scheduled (ie start date > now+10min)
                        scheduled = dateUI.getDatestamp() + timeUI.getTimestamp();
                        if ((scheduled - now.getTime()) > 600000) session.set("status", "scheduled");
                        session.set("date", dateUI.getDate());
                        
                        // add invited list if mode is boardroom or all user contacts if mode is campfire
                        if (session.get("mode") === "boardroom"){
                                invited.loop(function(v,i){
                                        session.get("invited").push(v.userid);        
                                });
                        }
                        
                        if (session.get("mode") === "campfire"){
                                session.set("invited", Utils.getUserContactIds());
                        }
                        
                        // init chat document and add id to session doc
                        chatId = session.get("_id")+"_0";
                        chat.push(chatId);
                        session.set("chat", chat);
                        
                        // init session couchdbdocument
                        cdb.reset(JSON.parse(session.toJSON()));
                        cdb.setTransport(Config.get("transport"));
                        
                        // create session document in database
                        cdb.sync(Config.get("db"), cdb.get("_id"))
                        .then(function(){
                                // create chat document
                                return widget.createChat(chatId);
                        })
                        .then(function(){
                        // upload session document
                                return cdb.upload();      
                        })
                        .then(function(){
                                var obs = Config.get("observer");
                                if (cdb.get("mode") === "boardroom"){
                                        error.set("errormsg", labels.get("sendinginvites"));
                                        widget.sendInvites(cdb.get("invited"), cdb.get("_id"), cdb.get("title"), cdb.get("scheduled")).then(function(){
                                                // if session is scheduled show session list else enter waiting room
                                                (cdb.get("scheduled")) ? obs.notify("show-session", session) : obs.notify("start-mu_session", cdb.get("_id"));
                                                promise.fulfill();
                                                cdb.unsync();
                                        });
                                }
                                else {
                                        // if session is scheduled show session list else enter waiting room
                                        (cdb.get("status") === "scheduled") ? obs.notify("show-session", session) : obs.notify("start-mu_session", cdb.get("_id"));
                                        promise.fulfill();
                                        cdb.unsync();       
                                }        
                        });
                        return promise;
                };
                
                widget.sendInvites = function sendInvites(idlist, sid, stitle, ssched){
                        var promise = new Promise(),
                            now = new Date(),
                            json = {
                                "type" : "INV",
                                "status" : "unread",
                                "date" : [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getMinutes()],
                                "author" : user.get("_id"),
                                "username" : user.get("username"),
                                "firstname" : user.get("firstname"),
                                "toList" : "",
                                "ccList" : "",
                                "object" : "",
                                "body" : "",
                                "signature" : "",
                                "docId" : sid,
                                "docTitle": stitle,
                                "scheduled": ssched,
                                "dest" : idlist
                                };
                        
                        Config.get("transport").request("Notify", json, function(result){
                                                error.set("errormsg", labels.get("invitesent"));
                                                promise.fulfill();
                        });
                        
                        return promise;    
                };
                
                // init
                widget.reset();
                
                // manage language change
                user.watchValue("lang", function(){
                        // reset session and error stores to trigger label refresh
                        var tempSession = JSON.parse(session.toJSON()),
                            tempError = JSON.parse(error.toJSON());
                        session.reset({});
                        session.reset(tempSession);
                        error.reset({});
                        error.reset(tempError);        
                });
                return widget;   
           };
});