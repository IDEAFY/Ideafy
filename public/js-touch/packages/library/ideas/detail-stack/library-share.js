/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "service/config", "Bind.plugin", "Event.plugin", "Store", "service/avatar", "service/utils", "service/autocontact", "CouchDBDocument", "Promise"], 
        function(Widget, Map, Config, Model, Event, Store, Avatar, Utils, AutoContact, CouchDBDocument, Promise){
                return function LibraryShareConstructor($action){
                //declaration
                        var _widget = new Widget(),
                            _error = new Store({"errormsg": ""}),
                            _user = Config.get("user"),
                            _transport = Config.get("transport"),
                            _labels = Config.get("labels"),
                            _share = new Store({"body": "", "docId":"", "docType": "", "attachment": "", "docTitle":"", "signature": _user.get("signature")}),
                            contactList = new Store([]),
                            shareContacts = new Store([]),
                            sendInProgress = false;
                //setup
                        _widget.plugins.addAll({
                                "labels": new Model(_labels),
                                "share" : new Model(_share, {
                                        setHeader : function(title){
                                                this.innerHTML = _labels.get("sharing") + title;
                                        }
                                }),
                                "contacts" : new Model(shareContacts, {
                                        setSelected : function(selected){
                                                (selected)? this.innerHTML = "&#10003;":this.innerHTML="";
                                        }
                                }),
                                "auto" : new Model(contactList, {
                                        highlight : function(selected){
                                                (selected)? this.classList.add("selected") : this.classList.remove("selected");
                                        }
                                }),
                                "shareevent" : new Event(_widget),
                                "errormsg" : new Model(_error)
                        });
                        
                        _widget.template = '<div class="idea-share"><div class="header blue-dark"><span data-share="bind:setHeader, docTitle">Sharing idea</span></div><form class="form"><legend>Select contacts</legend><div class="selectall" data-labels="bind:innerHTML, selectall" data-shareevent="listen: touchstart, press; listen:touchend, selectAll">Select all</div><input class="search" data-shareevent="listen:touchstart, displayAutoContact; listen:input, updateAutoContact" data-labels="bind:placeholder, tocontactlbl"><div id="sharelistauto" class="autocontact invisible"><div class="autoclose" data-shareevent="listen:touchstart,close"></div><ul data-auto="foreach"><li data-auto="bind:innerHTML, username; bind:highlight, selected" data-shareevent="listen:touchend, select"></li></ul></div><div class="sharecontactlist"><ul data-contacts="foreach"><li class = "contact list-item" data-shareevent="listen:touchstart, discardContact"><p class="contact-name" data-contacts="bind:innerHTML, username"></p><div class="remove-contact"></div><p class="contact-intro" data-contacts="bind:innerHTML, intro"></p></li></ul></div><p><legend>Add a message</legend><textarea class="input sharemessage" data-share="bind:value, body"></textarea></p><p><legend>Signature</legend><textarea class="signature" data-share="bind:value, signature"></textarea></p><div class="sendmail-footer"><p class="send"><label class="cancelmail" data-labels="bind:innerHTML, cancellbl" data-shareevent="listen: touchstart, press; listen:touchend, cancel">Cancel</label><label class="sendmail" data-labels="bind:innerHTML, sharelbl" data-shareevent="listen:touchstart, press; listen:touchend, share">Share</label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p></div></form></div>';
                        
                        _widget.reset = function reset(idea){
                             _error.reset({"errormsg": ""});
                             _share.reset({"body": "", "docId":idea._id, "docType": idea.type, "docTitle": idea.title, "signature": _user.get("username")+" <"+_user.get("_id")+ ">"});
                             if (_user.get("signature")) _share.set("signature", _user.get("signature"));
                             shareContacts.reset([]);
                             contactList.reset(_user.get("connections"));
                        };
                        
                        _widget.updateAutoContact = function(event, node){
                                var arr = JSON.parse(contactList.toJSON()), connections = _user.get("connections"), 
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
                                        if(shareContacts.toJSON().search(v.contact.userid) >-1) contactList.update(i, "selected", true);        
                                });
                        };
                        
                        _widget.close = function close(event, node){
                                node.parentNode.classList.add("invisible");         
                        };
                        
                        _widget.displayAutoContact = function(event, node){
                                document.getElementById("sharelistauto").classList.remove('invisible');
                                // reset contactList with all user connections
                                contactList.reset(_user.get("connections"));       
                        };
                        
                        _widget.discardContact = function(event,node){
                                var id = node.getAttribute("data-contacts_id"),
                                    userid = shareContacts.get(id).userid;
                                shareContacts.alter("splice", id, 1);
                                contactList.loop(function(v,i){
                                        if (v.userid === userid) {
                                                setTimeout(function(){contactList.update(i, "selected", false);}, 200);
                                        }
                                });
                                // unselect group if applicable
                                _widget.unselectGroup(userid);      
                        };
                        
                        _widget.select = function(event, node){
                                var id = node.getAttribute("data-auto_id");
                                if (contactList.get(id).selected){
                                        _widget.removeContact(contactList.get(id));
                                        setTimeout(function(){
                                                contactList.update(id, "selected", false);
                                                document.getElementById("sharelistauto").classList.add("invisible");
                                        }, 200);
                                }
                                else {
                                        _widget.addContact(contactList.get(id));
                                        _widget.selectGroup();
                                        setTimeout(function(){
                                                contactList.update(id, "selected", true);
                                                document.getElementById("sharelistauto").classList.add("invisible");
                                                }, 200);        
                                }
                        };
                        
                        _widget.selectAll = function(event, node){
                                node.classList.remove("pressed");
                                shareContacts.reset([]); // to avoid duplicates
                                contactList.reset(_user.get("connections"));
                                contactList.loop(function(v, i){
                                        contactList.update(i, "selected", true);
                                        if (v.type === "user") shareContacts.alter("push", v)        
                                });  
                        };
                        
                        _widget.removeContact = function(contact){
                                if (contact.type === "group"){
                                        for (j=contact.contacts.length-1; j>=0; j--){
                                                _widget.removeContact(contact.contacts[j]);
                                        }        
                                }
                                else{
                                        shareContacts.loop(function(v,i){
                                                if (v.userid === contact.userid) shareContacts.alter("splice", i, 1);        
                                        });
                                        // unselect group if applicable
                                        _widget.unselectGroup(contact.userid);
                                        // unselect contact
                                        contactList.loop(function(val, idx){
                                                if (val.userid === contact.userid) contactList.update(idx, "selected", false);        
                                        });
                                }
                        };
                        
                        _widget.selectGroup = function(){
                                var cts, add = false;
                                // check unselected groups
                                contactList.loop(function(v,i){
                                        if (v.type === "group" && !v.selected){
                                                cts = v.contacts;
                                                add = true;
                                                for (j=cts.length-1;j>=0; j--){
                                                        if (shareContacts.toJSON().search(cts[j].userid)<0){
                                                                add = false;
                                                                break;
                                                        }
                                                }
                                                if (add) {contactList.update(i, "selected", true);}
                                        }        
                                });  
                        };
                        
                        _widget.unselectGroup = function(userid){
                                // first loop through all selected groups
                                contactList.loop(function(v,i){
                                        if (v.type === "group" && v.selected){
                                                if (JSON.stringify(v.contacts).search(userid)>0) contactList.update(i, "selected", false);
                                        }       
                                }); 
                        };
                        
                        _widget.addContact = function(contact){
                                var i, l, add=true;
                                if (contact.type === "user") shareContacts.alter("push", contact)
                                else{
                                        for(i=0, l=contact.contacts.length; i<l; i++){
                                                shareContacts.loop(function(val,idx){
                                                        if (val.userid === contact.contacts[i].userid) {add = false;}              
                                                });
                                                if (add) {
                                                        shareContacts.alter("push", contact.contacts[i]);
                                                        contactList.loop(function(val,idx){
                                                                if (val.userid === contact.contacts[i].userid) {
                                                                        contactList.update(idx, "selected", true);
                                                                }
                                                        }); 
                                                }
                                        }       
                                }       
                        };
                        
                        _widget.press = function(event, node){
                             node.classList.add("pressed");        
                        };
                        
                        _widget.share = function(event, node){
                                var now = new Date(),
                                    json = {
                                        "type" : "DOC",
                                        "status" : "unread",
                                        "date" : [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getMinutes()],
                                        "author" : _user.get("_id"),
                                        "username" : _user.get("username"),
                                        "firstname" : _user.get("firstname"),
                                        "toList" : "",
                                        "ccList" : "",
                                        "object" : "",
                                        "body" : _share.get("body"),
                                        "signature" : _share.get("signature"),
                                        "docId" : _share.get("docId"),
                                        "docType" : _share.get("docType"), // same as in CouchDB for future use (e.g. sharing cards)
                                        "docTitle" : _share.get("docTitle"),
                                        "dest" : []
                                    };
                                
                                if (!sendInProgress){
                                        sendInProgress = true;
                                        // build recipient list (json.dest)
                                        shareContacts.loop(function(v, i){
                                                json.dest.push(v.userid);                
                                        });
                                  
                                        _transport.request("Notify", json, function(result){
                                                _error.set("errormsg", _labels.get("shareok"));
                                                node.classList.remove("pressed");
                                                // update sharedwith field of idea
                                                _widget.updateSharedWith(json.docId, json.dest)
                                                .then(function(){
                                                        _error.set("errormsg", "");
                                                        sendInProgress = false;
                                                        $action("close"); 
                                                });
                                        });
                                }            
                        };
                        
                        _widget.cancel = function(event, node){
                                node.classList.remove("pressed");
                                $action("close");       
                        };
                        
                        _widget.updateSharedWith = function updateSharedWith(id, userlist){
                                var cdb = new CouchDBDocument(),
                                    promise = new Promise();
                                cdb.setTransport(_transport);
                                cdb.sync(Config.get("db"), id).then(function(){
                                        var sharedwith = cdb.get("sharedwith") || [], i, add = true;
                                        // if sharedwith is empty simply replace with user list
                                        if (sharedwith === []) cdb.set("sharedwith", userlist)
                                        else {
                                                userlist.forEach(function(userid){
                                                        add = true;
                                                        for (i = sharedwith.length-1; i>=0; i--){
                                                                if (sharedwith[i] === userid) add = false;
                                                        }
                                                        if (add) sharedwith.push(userid)
                                                });
                                                cdb.set("sharedwith", sharedwith);
                                        }
                                        return cdb.upload();
                                })
                                .then(function(){
                                        promise.fulfill();      
                                });                  
                        };
                        
                        _widget.place(Map.get("library-share"));

                //return
                        return _widget;
                };
        });