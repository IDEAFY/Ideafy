/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      emily = require("../../../libs/emily").
      amy = require("../../../libs/amy2"),
      Widget = olives.OObject,
      Map = require("../../../services/map"),
      Config = require("../../../services/config"),
      Stack = amy.StackPlugin,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Control = amy.ControlPlugin,
      Store = emily.Store,
      Avatar = require("../../../services/avatar"),
      ActionBar = require("../../../services/actionbar"),
      AddContact = require("./addcontact"),
      AddGroup = require("./addgroup"),
      ContactDetails = require("./contact-detail"),
      GroupDetails = require("./group-detail");
module.exports = function ContactsConstructor(){
                        
                        var contactsUI = new Widget(),
                            detailStack = new Stack(),
                            addContact = new AddContact(),
                            addGroup = new AddGroup(),
                            contactDetails = new ContactDetails(),
                            groupDetails = new GroupDetails(),
                            sortButtons = new Store([
                                    {"name": "all", "label": "allbtn", "selected": true},
                                    {"name": "users", "label": "usrbtn", "selected": false},
                                    {"name": "groups", "label": "grpbtn", "selected": false}
                            ]),
                            currentSort = 0,
                            contactList = new Store([]),
                            currentBar = null,
                            user = Config.get("user"),
                            labels = Config.get("labels"),
                            sortContacts = function(id){
                                    var type = sortButtons.get(id).name,
                                        contacts = user.get("connections"),
                                        l = contacts.length,
                                        result = [];
                                    
                                    switch (type){
                                            case "users":
                                                for (i=0; i<l;i++){
                                                        if (contacts[i].type === "user") result.push(contacts[i]);
                                                }
                                                break;
                                            case "groups":
                                                for (i=0; i<l;i++){
                                                        if (contacts[i].type === "group") result.push(contacts[i]);
                                                }
                                                break;
                                            default:
                                                result = contacts;
                                    }
                                    
                                    return result;
                            },
                            searchContacts = function(text){
                                var contacts = [], result = [];
                                contacts = user.get("connections").concat();
                                
                                if (text === ""){
                                        result = contacts;
                                        sortButtons.update(0, "selected", true);
                                        currentSort = 0;
                                }
                                else{
                                        for (i=0, l=contacts.length; i<l;i++){
                                                if(JSON.stringify(contacts[i]).toLowerCase().search(text.toLowerCase()) > -1) result.push(contacts[i]);
                                        }
                                }
                                return result;         
                            };
                        
                        contactsUI.plugins.addAll({
                                "label": new Model(labels),
                                "sort": new Model(sortButtons, {
                                        "setLabel" : function(name){
                                                this.innerHTML = labels.get(name);
                                        },
                                        "setSelected" : function(selected){
                                                (selected)?this.classList.add("pressed"):this.classList.remove("pressed");
                                        }
                                }),
                                "contact": new Model(contactList,{
                                        setAvatar : function setAvatar(type){
                                                var id = this.getAttribute("data-contact_id"), _frag, _ui;
                                                if (type === "group"){
                                                        if (this.hasChildNodes()) this.removeChild(this.firstChild);
                                                        this.setAttribute("style", "background: url('img/connect/"+contactList.get(id).color+"') no-repeat center center; background-size: contain;display:block; width:40px; height:40px;float:left;");
                                                }
                                                else if (type === "user"){
                                                    this.setAttribute("style", "background:none;");
                                                    _frag = document.createDocumentFragment();
                                                    _ui = new Avatar([contactList.get(id).userid]);
                                                    _ui.place(_frag);
                                                     (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                                }
                                        },
                                        setIntro : function(intro){
                                                (intro) ? this.innerHTML = intro : this.innerHTML = " ";
                                        }
                                }),
                                "contactdetailstack": detailStack,
                                "contactlistcontrol": new Control(contactsUI),
                                "contactlistevent": new Event(contactsUI)
                        });
                        
                        contactsUI.template = '<div id="connect-contacts"><div class="contacts"><div class="header blue-light"><span data-label="bind: innerHTML, contactlistheadertitle">My Contacts</span><div class="option right" data-contactlistevent="listen: mousedown, plus"></div></div><ul class="selectors" data-sort = "foreach"><li class="sort-button" data-sort="bind: setLabel, label; bind:setSelected, selected, bind: name, name" data-contactlistevent="listen:mousedown, displaySort"></li></ul><input class="search" type="text" data-label="bind: placeholder, searchmsgplaceholder" data-contactlistevent="listen: keypress, search"><div class="contactlist overflow" data-contactlistcontrol="radio:li,selected,mousedown,selectContact"><ul data-contact="foreach"><li class="contact list-item" data-contactlistevent="listen:mousedown, setStart; listen:dblclick, showActionBar"><div data-contact="bind:setAvatar, type"></div><p class="contact-name" data-contact="bind:innerHTML, username"></p><p class="contact-intro" data-contact="bind:setIntro, intro"></p><div class="select-contact"></div></li></ul></div></div><div id="toggleadd" class="group" data-contactlistevent="listen:mousedown, press; listen:mouseup, toggleAddUI"></div><div id="contact-detail" class="details" data-contactdetailstack="destination"></div></div>';
                        
                        contactsUI.place(Map.get("connect-contacts"));
                        
                        contactsUI.plus = function plus(event, node){
                                var toggle = document.getElementById("toggleadd");
                                detailStack.getStack().get("#addcontact").reset();
                                detailStack.getStack().show("#addcontact");
                                if (toggle.classList.contains("user")){
                                        toggle.classList.remove("user");      
                                }
                                toggle.classList.add("group");    
                        };
                        
                        contactsUI.init = function init(){
                                contactList.reset(user.get("connections"));
                                // show add Contact page by default
                                addContact.init().then(function(){
                                        detailStack.getStack().show("#addcontact");        
                                });
                                addGroup.init();
                                groupDetails.init();
                        };
                        
                        contactsUI.reset = function reset(){
                                contactList.reset(user.get("connections"));
                                addContact.reset();
                                detailStack.getStack().show("#addcontact");        
                        };
                        
                        contactsUI.getSelectedContact = function(){
                                var node = document.querySelector(".contact.selected"), id = -1;
                                if (node) id = node.getAttribute("data-contact_id");
                                return id;
                        };
                        
                        contactsUI.selectContact = function(event){
                                var id = event.target.getAttribute("data-contact_id"),
                                    contact = contactList.get(id);
                                document.getElementById("toggleadd").classList.remove("group");
                                document.getElementById("toggleadd").classList.remove("user");
                                if (contact.type === "user"){
                                        contactDetails.reset(contactList.get(id));
                                        if (detailStack.getStack().getCurrentName() !== "#contactdetails") detailStack.getStack().show("#contactdetails");
                                }
                                else {
                                        groupDetails.reset(contactList.get(id));
                                        if (detailStack.getStack().getCurrentName() !== "#groupdetails") detailStack.getStack().show("#groupdetails");
                                }
                        };
                        
                        contactsUI.displaySort = function(event, node){
                                var id = node.getAttribute("data-sort_id");
                                // reset list selection
                                contactList.reset([]);
                                // show default page
                                // detailStack.getStack().show("#defaultPage");
                                // cancel current sort
                                if (currentSort >-1) sortButtons.update(currentSort, "selected", false);
                                // perform sorting
                                sortButtons.update(id, "selected", true);
                                currentSort = id;
                                // display sorted list
                                 contactList.reset(sortContacts(id));
                        };
                        
                        contactsUI.search = function(event, node){
                                if (event.keyCode === 13){
                                        sortButtons.update(currentSort, "selected", false);
                                        currentSort = -1;
                                        contactList.reset(searchContacts(node.value));             
                                } 
                        };
                        
                        // Action bar
                        contactsUI.setStart = function(event, node){
                                currentBar && currentBar.hide();  // hide previous action bar 
                        };
                
                        contactsUI.showActionBar = function(event, node){
                                var id = node.getAttribute("data-contact_id"),
                                    display = false, frag;  
                                
                                // check if actionbar exists for this element
                                if (currentBar && currentBar.getParent() === node){
                                        display = true;
                                }
                                
                                if (!display){
                                        currentBar = new ActionBar("contact", node, contactList.get(id));
                                        frag = document.createDocumentFragment(); 
                                        currentBar.place(frag); // render action bar    
                                        node.appendChild(frag); // display action bar
                                        display = true; // prevent from showing it multiple times
                                }
                        };
                
                        contactsUI.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        contactsUI.toggleAddUI = function(event, node){
                                node.classList.remove("pressed");
                                if (node.classList.contains("group")){
                                        node.classList.remove("group");
                                        detailStack.getStack().get("#addgroup").reset();
                                        detailStack.getStack().show("#addgroup");
                                        node.classList.add("user");
                                }
                                else{
                                        node.classList.remove("user");
                                        detailStack.getStack().get("#addcontact").reset();
                                        detailStack.getStack().show("#addcontact");
                                        node.classList.add("group");        
                                } 
                        };
                        
                        // initialize
                        // add UIs to detail stack
                        detailStack.getStack().add("#contactdetails", contactDetails);
                        detailStack.getStack().add("#groupdetails", groupDetails);
                        detailStack.getStack().add("#addcontact", addContact);
                        detailStack.getStack().add("#addgroup", addGroup);
                        
                        addGroup.init();
                        
                        // get message list from user document
                        contactsUI.init();
                        
                        
                        // watch for changes in connections
                        user.watchValue("connections", function(){
                                var id;
                                // if no search is active
                                if (currentSort>-1) {
                                        contactList.reset(sortContacts(currentSort));
                                }
                                if (detailStack.getStack().getCurrentName() === "#contactdetails"){
                                        id = contactsUI.getSelectedContact();
                                        if (id>-1){
                                                contactDetail.reset(contactList.get(id));
                                                detailStack.getStack().show('#contactdetails');
                                        }
                                        else{
                                                detailStack.getStack().show("#addcontact");
                                                document.getElementById("toggleadd").classList.add("group");        
                                        } 
                                }          
                        });
                        
                        // watch for delete events to display addcontact UI
                        Config.get("observer").watch("contact-deleted", function(){
                                detailStack.getStack().show('#addcontact');
                        });
                        
                        // watch for language change
                        user.watchValue("lang", function(){
                                var current;
                                sortButtons.loop(function(v,i){
                                        if (v.selected) current = i;        
                                });
                                sortButtons.reset([
                                    {"name": "all", "label": "allbtn", "selected": false},
                                    {"name": "users", "label": "usrbtn", "selected": false},
                                    {"name": "groups", "label": "grpbtn", "selected": false}
                                ]);
                                sortButtons.update(current, "selected", true);
                        });
                        
};
