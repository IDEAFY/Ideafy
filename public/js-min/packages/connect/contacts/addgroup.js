/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Bind.plugin", "Event.plugin", "Store", "service/avatar"],
        function(Widget, Config, Model, Event, Store, Avatar){
                
           return function AddGroupConstructor(){
                   
             var addGroupUI = new Widget(),
                 group = new Store({
                        "username": "",
                        "intro": "",
                        "type": "group",
                        "color": "graygroup.png",
                        "contacts": []
                 }),
                 colors = new Store([
                         {"color":"#4D4D4D", "icon": "graygroup.png", "selected": true},
                         {"color":"#657B99", "icon": "bluegroup.png", "selected": false},
                         {"color":"#9AC9CD", "icon": "azurgroup.png", "selected": false},
                         {"color":"#5F8F28", "icon": "greengroup.png", "selected": false},
                         {"color":"#F2E520", "icon": "yellowgroup.png", "selected": false},
                         {"color":"#F27B3D", "icon": "orangegroup.png", "selected": false},
                         {"color":"#BD262C", "icon": "redgroup.png", "selected": false}
                 ]),
                 displayContacts = new Store([]),
                 contactList = new Store([]),
                 error = new Store({"error":""}),
                 selected = {},
                 user = Config.get("user"),
                 labels = Config.get("labels");
             
             
             addGroupUI.plugins.addAll({
                     "label" : new Model(labels),
                     "error" : new Model(error),
                     "color" : new Model(colors, {
                             setColor : function(color){
                                     this.setAttribute("style", "background:"+color+";");
                             },
                             setSelected : function(selected){
                                     (selected)? this.innerHTML = "&#10003;":this.innerHTML="";
                             }
                     }),
                     "group" : new Model(group,{
                             setColor : function(value){
                                        this.setAttribute("style", "background: url('img/connect/"+value+"') no-repeat top left; background-size: contain;");
                             },
                             setStyle : function(sentok){
                                     (sentok) ? this.setAttribute("style", "color: #5F8F28;"):this.setAttribute("style", "color: #F27B3D;")
                             },
                             setVisible : function(contacts){
                                     (contacts.length)?this.classList.remove("invisible"):this.classList.add("invisible");
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
                     "auto" : new Model(contactList, {
                             highlight : function(selected){
                                        (selected)? this.classList.add("selected") : this.classList.remove("selected");
                                }
                     }),
                     "addgrpevent" : new Event(addGroupUI)
             });
             
             addGroupUI.template = '<div id="addgroup"><div class="header blue-dark"><span class="newfolderlbl" data-label="bind:innerHTML, newfolderlbl"></span></div><div class = "detail-contents"><div class="folderpic" data-group="bind: setColor, color"></div><form><p><input type="text" class="input" data-group="bind:value, username" data-label="bind:placeholder, groupnamelbl"></p><p><textarea class="input" data-group="bind:value, intro" data-label="bind:placeholder, groupdesclbl"></textarea></p><legend data-label="bind:innerHTML, colortouch"></legend><ul class="groupcolors" data-color="foreach"><li data-color="bind:setColor, color; bind:setSelected, selected" data-addgrpevent="listen: touchstart, selectColor"></li></ul></form><div class = "groupcontactlist" data-group="bind: setVisible, contacts"><legend name="list" data-label="bind:innerHTML, grpcontacts" data-addgrpevent="listen: touchstart, toggleHide"></legend><ul class="contactlistdetail" data-contacts="foreach"><li class = "contact list-item" data-addgrpevent="listen:touchstart, discardContact"><div data-contacts="bind:setAvatar, userid"></div><p class="contact-name" data-contacts="bind:innerHTML, username"></p><div class="remove-contact"></div><p class="contact-intro" data-contacts="bind:innerHTML, intro"></p></li></ul></div><div class="addgroupbtns"><span class="errormsg" data-error="bind:innerHTML, error"></span><div class="addct" data-addgrpevent="listen:touchstart, press; listen:touchend, add"></div><div class="cancelct" data-addgrpevent="listen:touchstart, press; listen:touchend, cancel"></div></div><div class="addgrpcontacts"><legend name="add" data-label="bind:innerHTML, addgrpcontacts" data-addgrpevent="listen: touchstart, toggleHide"></legend><div class="addgrpcontactdetails"><input class="search" data-addgrpevent="listen:keyup, updateAutoContact" data-labels="bind:placeholder, tocontactlbl"><div class = "autocontact"><ul data-auto="foreach"><li data-auto="bind:innerHTML, contact.username; bind:highlight, selected" data-addgrpevent="listen:touchend, select"></li></ul></div></div></div></div>';
             
             addGroupUI.init = function init(){
                     //initialize contact list with all user contacts in user's document
                     user.get("connections").forEach(function(item){
                        if (item.type === "user") contactList.alter("push", {"contact":item, "selected":false});        
                     });
                     
             };
             
             addGroupUI.selectColor = function(event, node){
                var id = node.getAttribute("data-color_id");
                colors.loop(function(v,i){
                        colors.update(i, "selected", false);
                });
                colors.update(id, "selected", true);
                group.set("color", colors.get(id).icon);
             };
             
             addGroupUI.toggleHide = function(event, node){
                var name = node.getAttribute("name");
                
                if (node.classList.contains("hide")) {
                        node.classList.remove("hide");
                        (name === "add") ? document.querySelector(".addgrpcontactdetails").classList.remove("invisible"):document.querySelector(".contactlistdetail").classList.remove("invisible");
                }
                else{
                        node.classList.add("hide");
                        (name === "add") ? document.querySelector(".addgrpcontactdetails").classList.add("invisible"):document.querySelector(".contactlistdetail").classList.add("invisible");
                }       
             };
             
             addGroupUI.select = function(event, node){
                     var id = node.getAttribute("data-auto_id");
                     if (contactList.get(id).selected){
                             addGroupUI.removeContact(id);
                             setTimeout(function(){contactList.update(id, "selected", false);}, 200);
                     }
                     else {
                             addGroupUI.addContact(id);
                             setTimeout(function(){contactList.update(id, "selected", true);}, 200);        
                     }
             };
             
             addGroupUI.addContact = function addContact(id){
                var current  = JSON.parse(displayContacts.toJSON()), contact = contactList.get(id).contact, index = 0;
                // check if contact is no yet present in group
                if (displayContacts.toJSON().search(contact.userid) < 0){
                        for (i=0, l =current.length; i<l; i++){
                                if (contact.lastname > current[i].lastname) index++
                                else if (contact.lastname === current[i].lastname && contact.username > current[i].username) index++;
                        }
                        // insert new contact at index position
                        current.splice(index, 0, contact);
                        //display list
                        displayContacts.reset(current);
                        // update contacts array of group
                        group.set("contacts", current);
                }
             };
             
             addGroupUI.removeContact = function removeContact(id){
                var contacts = JSON.parse(displayContacts.toJSON());
                for (i=contacts.length-1;i>=0;i--){
                        if (contacts[i].userid === contactList.get(id).contact.userid) contacts.splice(i,1);
                }
                displayContacts.reset(contacts);
             };
             
             addGroupUI.updateAutoContact = function(event, node){
                     var arr = JSON.parse(contactList.toJSON()), connections = user.get("connections"), 
                         clc, vlc = node.value.toLowerCase(); // lowercase conversion
                if (node.value === ""){
                        arr = [];
                        //initialize contact list with all user contacts in user's document
                        for(i=0, l =connections.length; i<l; i++){
                                if (connections[i].type === "user") {
                                        arr.push({"contact":connections[i], "selected": false});
                                }       
                        }
                }
                else if (event.keyCode === 8 || event.keyCode === 46){
                        // reinitialize arr with all connections
                        arr = [];
                        for(i=0, l =connections.length; i<l; i++){
                                if (connections[i].type === "user") {
                                        arr.push({"contact":connections[i], "selected": false});
                                }       
                        }
                        // search for the string & remove unwanted contacts
                        for (i=arr.length-1; i>=0; i--){
                                if (arr[i].contact.username.toLowerCase().search(vlc) !== 0) {arr.splice(i, 1);}
                        }
                }
                else{
                        for (i=arr.length-1; i>=0; i--){
                                clc = arr[i].contact.username.toLowerCase();
                                if (clc.search(vlc) !== 0) arr.splice(i, 1);
                        }   
                }
                contactList.reset(arr);
                // check if items are present in the group and set selected status accordingly
                contactList.loop(function(v,i){
                        
                        if(displayContacts.toJSON().search(v.contact.userid) >-1) contactList.update(i, "selected", true);        
                });
             };
             
             addGroupUI.discardContact = function(event, node){
                    var id = node.getAttribute("data-contacts_id"),
                        userid = displayContacts.get(id).userid;
                    displayContacts.alter("splice", id, 1);
                    contactList.loop(function(v,i){
                            if (v.contact.userid === userid) setTimeout(function(){contactList.update(i, "selected", false);}, 200);
                    });
             };
             
             addGroupUI.reset = function reset(){
                group.reset({"username": "", "intro": "", "type": "group", "color": "graygroup.png", "contacts": [] });
                displayContacts.reset([]);
                contactList.reset([]);
                error.reset({"error":""});
                //initialize contact list with all user contacts in user's document
                user.get("connections").forEach(function(item){
                        if (item.type === "user") contactList.alter("push", {"contact":item, "selected": false});        
                });       
             };
             
             addGroupUI.press = function(event, node){
                node.classList.add("pushed");        
             };
             
             addGroupUI.cancel = function(event, node){
                     node.classList.remove("pushed");
                     addGroupUI.reset();
                     //clear input field
                     document.querySelector("#addgroup input.search").value="";       
             };
             
             addGroupUI.add = function(event, node){
                     var connections = user.get("connections"), index=0, grp = JSON.parse(group.toJSON());
                
                node.classList.remove("pushed");
                error.set("error", "");
                // add group to user contacts
                if (grp.username === ""){
                        error.set("error", labels.get("nogrpname"));
                }
                else if (grp.intro === ""){
                        error.set("error", labels.get("nogrpintro"));
                }
                else if (!grp.contacts.length){
                        error.set("error", labels.get("nocontactselected"));
                }
                else{
                        for (i=0, l = connections.length; i<l; i++){
                                if (connections[i].type === "user"){
                                        if(grp.username > connections[i].lastname) index++;
                                }
                                else{
                                        if (grp.username === connections[i].username) {
                                                error.set("error", labels.get("grpnameexists"));
                                        }
                                        if (grp.username > connections[i].username) index++
                                }
                        }
                        // insert new contact at index position
                        if (!error.get("error")) {
                                connections.splice(index, 0, grp);
                                user.set("connections", connections);
                                user.upload().then(function(){
                                        addGroupUI.reset();        
                                });
                        }                     
                }
                
             };
             
             // addGroupUI.init(); --init now called by contact.js
             
             return addGroupUI;
                   
           };   
        });
