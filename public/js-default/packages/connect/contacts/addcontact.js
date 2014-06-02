/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "Bind.plugin", "Event.plugin", "CouchDBView", "Store", "service/avatar", "Promise", "lib/spin.min"],
        function(Widget, Config, Model, Event, CouchDBView, Store, Avatar, Promise, Spinner){
                
           return function AddContactConstructor(){
                   
             var addContactUI = new Widget(),
                 count = new CouchDBView(),
                 search = new Store({"email":"", "firstname":"", "lastname":"", "result":"", "display": false, "sentok": false, "message":"", "invite":false}),
                 displayContacts = new Store([]),
                 selected = {},
                 user = Config.get("user"),
                 transport = Config.get("transport"),
                 labels = Config.get("labels"),
                 spinner = new Spinner({color:"#5F8F28", lines:8, length: 8, width: 4, radius:8, left: 26, top: -7}).spin(),
                 validateSearch = function(name, value){
                         var emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
                         if (name === "email"){
                                if (emailPattern.test(value.toLowerCase())){
                                        search.set("result", ""); //clear error messages
                                        searchContact("userid", value.toLowerCase());
                                }
                                else{
                                        search.set("result", labels.get("signupinvalidemail"));
                                }       
                         }
                         else{
                                 if (search.get("email")) {
                                         search.set("result", labels.get("clearemailfirst"));
                                 }
                                 else{
                                         if (search.get("firstname") && search.get("lastname")){
                                                search.set("result", ""); //clear error messages
                                                searchContact("username", search.get("firstname").toLowerCase()+" "+search.get("lastname").toLowerCase());       
                                         }
                                         else{
                                                 search.set("result", labels.get("needbothfnln"));
                                         }
                                 }
                         }
                 },
                 searchContact = function(type, value){
                         var cdb = new CouchDBView();
                         cdb.setTransport(transport);
                         if (type === "userid"){
                                cdb.sync(Config.get("db"), "users", "_view/searchbyid", {key: '"'+value+'"', descending: true})
                                .then(function(){
                                        displayContacts.reset(JSON.parse(cdb.toJSON()));
                                        (displayContacts.getNbItems()) ? search.set("display", true) : search.set("invite", true);
                                        cdb.unsync();
                                });        
                         }
                         else{
                                cdb.sync(Config.get("db"), "users", "_view/searchbyusername", {key: '"'+value+'"', descending: true})
                                .then(function(){
                                        displayContacts.reset(JSON.parse(cdb.toJSON()));
                                        (displayContacts.getNbItems()) ? search.set("display", true) : search.set("result", labels.get("noentryfound"));
                                        cdb.unsync();
                                });        
                         }
                 },
                 validateContactRequest = function(contact){
                         var res = false, sent = user.get("sentMessages") || [], cx = user.get("connections"), sentCXR = false, existing = false, i, j, k,l;
                        // verify if it is an existing contact or if a request has been made in the last 30 days
                        if (contact.userid === user.get("_id")) {
                                search.set("result", labels.get("cannotaddself"));
                        }
                        else {
                                for (j=0, k=cx.length;j<k; j++){
                                        if (cx[j].userid === contact.userid){
                                                existing = true;
                                                break;
                                        }
                                }
                                if (existing){
                                        search.set("result", contact.username+labels.get("alreadyconnected"));         
                                }
                                else{
                                        for(i=0, l=sent.length;i<l;i++){
                                                if (sent[i].type ==="CXR" && sent[i].toList.search(contact.username)>-1){
                                                        sentCXR = true;
                                                        break;       
                                                }
                                        }
                                        (sentCXR) ? search.set("result", labels.get("alreadysentCXR")+contact.username) : res = true;
                                               
                                }      
                        }       
                        return res;     
                 },
                 addContact = function(contact){
                        var now = new Date(), json={};
                        if(validateContactRequest(contact)){
                                json.dest = [contact.userid];
                                json.type = "CXR";
                                json.status = "unread";
                                json.date = [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
                                json.author = user.get("_id");
                                json.username = user.get("username");
                                json.firstname = user.get("firstname");
                                json.toList = contact.username;
                                json.ccList = "";
                                json.object = user.get("username")+ labels.get("CXRobject");
                                json.body = search.get("message");
                                json.signature = user.get("signature");
                                json.contactInfo = { "firstname": user.get("firstname"), "lastname": user.get("lastname"), "userid": user.get("_id"), "username": user.get("username"), "intro": user.get("intro"), "type":"user"};
                                
                                transport.request("Notify", json, function(result){
                                        var res = JSON.parse(result);
                                        if (res[0].res === "ok") {
                                                search.set("result", labels.get("CXRsent"));
                                                // wait 2 seconds then clear the UI
                                                setTimeout(function(){addContactUI.reset();}, 2000);
                                        }
                                        else {
                                                model.set("result", "There was an error, please try again later");
                                        }
                                });
                        }      
                 };
             
             
             addContactUI.plugins.addAll({
                     "label" : new Model(labels),
                     "count" : new Model(count),
                     "search" : new Model(search,{
                             setVisible : function(value){
                                        (value)?this.classList.remove("invisible"):this.classList.add("invisible");
                             },
                             setStyle : function(sentok){
                                     (sentok) ? this.setAttribute("style", "color: #5F8F28;"):this.setAttribute("style", "color: #F27B3D;");
                             }
                     }),
                     "contacts" : new Model(displayContacts, {
                                setAvatar : function setAvatar(id){
                                        var frag, ui;
                                        _frag = document.createDocumentFragment();
                                        _ui = new Avatar([id]);
                                        _ui.place(_frag);
                                        (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                },
                                setSelected : function(selected){
                                        (selected)? this.innerHTML = "&#10003;":this.innerHTML="";
                                }
                     }),
                     "searchdbevent" : new Event(addContactUI),
                     "invitecontactevent" : new Event(addContactUI)
             });
             
             addContactUI.template = '<div id="addcontact"><div class="header blue-dark"><span class="newcontactlbl" data-label="bind:innerHTML, newcontactlbl"></span></div><div class = "detail-contents"><div class="doctor-deedee"></div><div class="addcontactform"><p class="half"><span data-label="bind:innerHTML, beforecount"></span><strong><span data-count="bind:innerHTML, 0.value"></span></strong><span data-label="bind:innerHTML, aftercount"></span></p><p class="half" data-label="bind: innerHTML, addcontactrightintro"></p><legend data-label="bind:innerHTML, addcontactnow"></legend><input class="search" type="text" name="email" data-label="bind:placeholder, searchcontactplaceholder" data-search="bind: value, email" data-searchdbevent="listen: keypress, searchDB"><legend data-label="bind:innerHTML, lookup"></legend><div class="searchcontact"><input type="text" class="search half" name="fn" data-label="bind:placeholder, firstnameplaceholder" data-search="bind: value, firstname" data-searchdbevent="listen: keypress, searchDB"><input class="search half right" type="text" name="ln" data-label="bind: placeholder, lastnameplaceholder" data-search="bind: value, lastname" data-searchdbevent="listen: keypress, searchDB"></div><p class="searchresult" data-search="bind: innerHTML, result; bind:setStyle, sentok"></p></div><div class="contactinvite" data-search="bind: setVisible, invite"><p>The person you are looking for was not found in Ideafy. Would you like to send him/her an invitation ? You will receive 200 Ideafy Points if the person joins the community</p><div class="invitebuttons"><span class="sendmail" data-label="bind:innerHTML, sendlbl" data-invitecontactevent="listen: mousedown, press; listen:mouseup, sendInvite">Accept</span><span class="cancelmail" data-label="bind:innerHTML, cancellbl" data-invitecontactevent="listen: mousedown, press; listen:mouseup, cancelInvite">Cancel</span></div></div><div class = "contactlist invisible" data-search="bind: setVisible, display"><legend data-label="bind:innerHTML, selectcontact"></legend><ul data-contacts="foreach"><li class = "contact list-item"><div data-contacts="bind:setAvatar, value.userid"></div><p class="contact-name" data-contacts="bind:innerHTML, value.username"></p><p class="contact-intro" data-contacts="bind:innerHTML, value.intro"></p><div class="select-contact" data-searchdbevent="listen:mousedown, check"></div></li></ul><textarea class="input" data-label="bind:placeholder, addamessage" data-search="bind:value, message"></textarea><div class="addcontactbtns"><div class="addct" data-searchdbevent="listen:mousedown, push; listen:mouseup, add"></div><div class="cancelct" data-searchdbevent="listen:mousedown, push; listen:mouseup, cancel"></div></div></div></div></div>';
             
             addContactUI.init = function init(){
                     var promise = new Promise();
                     count.setTransport(transport);
                     count.sync(Config.get("db"), "users", "_view/count").then(function(){
                             promise.fulfill();
                     });
                     return promise;        
             };
             
             addContactUI.searchDB = function (event, node){
                     var field;
                     if (event.keyCode === 13){
                               // validate search
                               event.target.blur();
                               field = node.getAttribute("name");
                               validateSearch(field, node.value);
                     }        
             };
             
             addContactUI.check = function(event,node){
                var id = node.getAttribute("data-contacts_id");
                
                if (node.innerHTML){
                        node.innerHTML="";
                        selected[id]=false;
                }
                else{
                        node.innerHTML = "&#10003;";
                        selected[id]=true;
                }      
             };
             
             addContactUI.reset = function reset(){
                search.reset({"email":"", "firstname":"", "lastname":"", "result":"", "display": false, "sentok": false, "message":"", "invite":false});
                displayContacts.reset([]);       
             };
             
             addContactUI.push = function(event, node){
                node.classList.add("pushed");        
             };
             
             addContactUI.cancel = function(event, node){
                     node.classList.remove("pushed");
                     addContactUI.reset();        
             };
             
             addContactUI.press = function(event, node){
                     node.classList.add("pressed");
             };
             
             addContactUI.cancelInvite = function(event, node){
                     node.classList.remove("pressed");
                     addContactUI.reset();        
             };
             
             addContactUI.sendInvite = function(event, node){
                var json = {id: search.get("email").toLowerCase(), senderid: user.get("_id"), sendername: user.get("username"), subject:user.get("username")+labels.get("invitesyou"), body:labels.get("invitebody")};
                spinner.spin(node);
                transport.request("Invite", json, function(result){
                        if (result === "ok"){
                                alert(labels.get("invitationsent"));
                        }
                        if (result === "alreadyinvited"){
                                alert(labels.get("alreadyinvited"));
                        }
                        spinner.stop();
                        node.classList.remove("pressed");
                        addContactUI.reset();
                });        
             };
             
             addContactUI.add = function(event, node){
                
                node.classList.remove("pushed");
                // add selected contact(s)
                for (i in Object.keys(selected)){
                        addContact(displayContacts.get(i).value);                
                }
             };
             
             //addContactUI.init();
             return addContactUI;
                   
           };   
        });