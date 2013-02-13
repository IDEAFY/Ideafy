/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "service/config", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "service/avatar"],
        function(Widget, Config, Model, Event, Store, Avatar){
                
                return function GroupDetailsConstructor(){
                        
                        var groupDetails = new Widget(),
                            group = new Store(),
                            grpcontacts = new Store([]),
                            currentGroupInfo,
                            colorList = [
                                {"color":"#4D4D4D", "icon": "graygroup.png", "selected": false},
                                {"color":"#657B99", "icon": "bluegroup.png", "selected": false},
                                {"color":"#9AC9CD", "icon": "azurgroup.png", "selected": false},
                                {"color":"#5F8F28", "icon": "greengroup.png", "selected": false},
                                {"color":"#F2E520", "icon": "yellowgroup.png", "selected": false},
                                {"color":"#F27B3D", "icon": "orangegroup.png", "selected": false},
                                {"color":"#BD262C", "icon": "redgroup.png", "selected": false}
                            ],
                            colors = new Store(colorList),
                            contactList = new Store([]),
                            error = new Store({"error":""}),
                            selected = {},
                            user = Config.get("user"),
                            labels = Config.get("labels");
                        
                        groupDetails.template = '<div id="groupdetails"><div class="header blue-dark"><span class="newfolderlbl" data-group="bind:innerHTML, username"></span></div><div class = "detail-contents"><div class="folderpic" data-group="bind: setColor, color"></div><form><p><input type="text" class="input" data-group="bind:value, username" data-label="bind:placeholder, groupnamelbl"></p><p><textarea class="input" data-group="bind:value, intro" data-label="bind:placeholder, groupdesclbl"></textarea></p><legend data-label="bind:innerHTML, colortouch"></legend><ul class="groupcolors" data-color="foreach"><li data-color="bind:setColor, color; bind:setSelected, selected" data-grpdetailsevent="listen: touchstart, selectColor"></li></ul></form><div class = "contactlistdetail" data-group="bind: setVisible, contacts"><legend name="list" data-label="bind:innerHTML, grpcontacts" data-grpdetailsevent="listen: touchstart, toggleHide"></legend><ul data-grpcontacts="foreach"><li class = "contact list-item" data-grpdetailsevent="listen:touchstart, discardContact"><div data-grpcontacts="bind:setAvatar, userid"></div><p class="contact-name" data-grpcontacts="bind:innerHTML, username"></p><div class="remove-contact"></div><p class="contact-intro" data-grpcontacts="bind:innerHTML, intro"></p></li></ul></div><p class="update"><label class="cancelmail" data-label="bind:innerHTML, cancellbl" data-grpdetailsevent="listen: touchstart, press; listen:touchend, cancel">Cancel</label><label class="sendmail" data-label="bind:innerHTML, updatelbl" data-grpdetailsevent="listen:touchstart, press; listen:touchend, update"></label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label><div class="addgrpcontacts"><legend name="add" data-label="bind:innerHTML, addgrpcontacts" data-grpdetailsevent="listen: touchstart, toggleHide"></legend><div class="addgrpcontactdetails"><input class="search" data-grpdetailsevent="listen:keyup, updateAutoContact" data-label="bind:placeholder, tocontactlbl"><div class = "autocontact"><ul data-auto="foreach"><li data-auto="bind:innerHTML, contact.username; bind:highlight, selected" data-grpdetailsevent="listen:touchend, select"></li></ul></div></div></div></div>';
                        
                        groupDetails.plugins.addAll({
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
                                "grpcontacts" : new Model(grpcontacts, {
                                        setAvatar : function setAvatar(id){
                                                var frag, ui;
                                                if (id){
                                                        _frag = document.createDocumentFragment();
                                                        _ui = new Avatar([id]);
                                                        _ui.place(_frag);
                                                        (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                                }
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
                                "grpdetailsevent" : new Event(groupDetails)
                        });
                        
                        groupDetails.selectColor = function(event, node){
                                var id = node.getAttribute("data-color_id");
                                colors.loop(function(v,i){
                                        colors.update(i, "selected", false);
                                });
                                colors.update(id, "selected", true);
                                group.set("color", colors.get(id).icon);
                        };
             
                        groupDetails.toggleHide = function(event, node){
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
             
                        groupDetails.select = function(event, node){
                                var id = node.getAttribute("data-auto_id");
                                if (contactList.get(id).selected){
                                        groupDetails.removeContact(id);
                                        setTimeout(function(){contactList.update(id, "selected", false);}, 200);
                                }
                                else {
                                        groupDetails.addContact(id);
                                        setTimeout(function(){contactList.update(id, "selected", true);}, 200);        
                                }
                        };
             
                        groupDetails.addContact = function addContact(id){
                                var current  = JSON.parse(grpcontacts.toJSON()), contact = contactList.get(id).contact, index = 0;
                                // check if contact is no yet present in group
                                if (grpcontacts.toJSON().search(contact.userid) < 0){
                                        for (i=0, l =current.length; i<l; i++){
                                                if (contact.lastname > current[i].lastname) index++
                                                else if (contact.lastname === current[i].lastname && contact.username > current[i].username) index++;
                                        }
                                        // insert new contact at index position
                                        current.splice(index, 0, contact);
                                        //display list
                                        grpcontacts.reset(current);
                                        // update contacts array of group
                                        group.set("contacts", current);
                                }
                        };
             
                        groupDetails.removeContact = function removeContact(id){
                                var contacts = JSON.parse(grpcontacts.toJSON());
                                for (i=contacts.length-1;i>=0;i--){
                                        if (contacts[i].userid === contactList.get(id).contact.userid) contacts.splice(i,1);
                                }
                                grpcontacts.reset(contacts);
                        };
             
                        groupDetails.updateAutoContact = function(event, node){
                                var arr = JSON.parse(contactList.toJSON()), connections = user.get("connections");
                                if (node.value === ""){
                                        arr = [];
                                        //initialize contact list with all user contacts in user's document
                                        for(i=0, l =connections.length; i<l; i++){
                                                if (connections[i].type === "user") {
                                                        arr.push({"contact":connections[i], "selected": false});
                                                }       
                                        }
                                        contactList.reset(arr);
                                }
                                else{
                                        for (i=arr.length-1; i>=0; i--){
                                                if (arr[i].contact.username.search(node.value) !== 0) arr.splice(i, 1);
                                        }
                                        contactList.reset(arr);    
                                }
                                // check if items are present in the group and set selected status accordingly
                                contactList.loop(function(v,i){
                                        if(grpcontacts.toJSON().search(v.contact.userid) >-1) contactList.update(i, "selected", true);        
                                });
                        };
             
                        groupDetails.discardContact = function(event, node){
                                var id = node.getAttribute("data-contacts_id"),
                                    username = grpcontacts.get(id).username;
                                grpcontacts.alter("splice", id, 1);
                                contactList.loop(function(v,i){
                                        if (v.contact.type === "group" && v.contact.username === username) setTimeout(function(){contactList.update(i, "selected", false);}, 200);
                                });
                        };
                        
                        groupDetails.press = function(event, node){
                                node.classList.add("pressed");        
                        };
             
                        groupDetails.cancel = function(event, node){
                                node.classList.remove("pressed");
                                groupDetails.reset(currentGroupInfo);        
                        };
             
                        groupDetails.update = function(event, node){
                                var connections = user.get("connections"), index=0, grp = JSON.parse(group.toJSON());
                                
                                console.log(grp, currentGroupInfo);
                                node.classList.remove("pressed");
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
                                        for (i = connections.length-1; i>=0; i--){
                                                if (connections[i].type === "group" && connections[i].username === currentGroupInfo.username){
                                                        // insert new contact at index position
                                                        if (!error.get("error")) {
                                                                connections.splice(i, 1, grp);
                                                                user.set("connections", connections);
                                                                user.upload().then(function(){
                                                                        groupDetails.reset(grp);
                                                                        error.set("error", labels.get("groupupdated"));       
                                                                });
                                                        }                    
                                                }
                                        }
                                }
                        };
                        
                        
                        groupDetails.reset = function reset(contactinfo){
                                colors.reset(colorList);
                                colors.loop(function(v,i){
                                        if (v.icon === contactinfo.color) colors.update(i, "selected", true);        
                                });
                                group.reset(contactinfo);
                                currentGroupInfo = contactinfo;
                                grpcontacts.reset(contactinfo.contacts);
                       };
                       
                       groupDetails.init = function init(){
                                //initialize contact list with all user contacts in user's document
                                user.get("connections").forEach(function(item){
                                        if (item.type === "user") contactList.alter("push", {"contact":item, "selected":false});        
                                });
                     
                        };
                        
                        groupDetails.init();
                        
                        return groupDetails;        
                        
                };
        });
