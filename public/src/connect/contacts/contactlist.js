define("ContactList", ["Olives/OObject", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Stack", "CouchDBStore", "Config", "Utils"], function(OObject, Map, Store, ModelPlugin, EventPlugin, Stack, CouchDBStore, Config, Utils) {

        return function ContactListConstructor(cObserver) {

                var userCDB = Config.get("user"), ContactList = new OObject(), index = new Store([{
                        "letter" : "A",
                        "active" : false
                }, {
                        "letter" : "B",
                        "active" : false
                }, {
                        "letter" : "C",
                        "active" : false
                }, {
                        "letter" : "D",
                        "active" : false
                }, {
                        "letter" : "E",
                        "active" : false
                }, {
                        "letter" : "F",
                        "active" : false
                }, {
                        "letter" : "G",
                        "active" : false
                }, {
                        "letter" : "H",
                        "active" : false
                }, {
                        "letter" : "I",
                        "active" : false
                }, {
                        "letter" : "J",
                        "active" : false
                }, {
                        "letter" : "K",
                        "active" : false
                }, {
                        "letter" : "L",
                        "active" : false
                }, {
                        "letter" : "M",
                        "active" : false
                }, {
                        "letter" : "N",
                        "active" : false
                }, {
                        "letter" : "O",
                        "active" : false
                }, {
                        "letter" : "P",
                        "active" : false
                }, {
                        "letter" : "Q",
                        "active" : false
                }, {
                        "letter" : "R",
                        "active" : false
                }, {
                        "letter" : "S",
                        "active" : false
                }, {
                        "letter" : "T",
                        "active" : false
                }, {
                        "letter" : "U",
                        "active" : false
                }, {
                        "letter" : "V",
                        "active" : false
                }, {
                        "letter" : "W",
                        "active" : false
                }, {
                        "letter" : "X",
                        "active" : false
                }, {
                        "letter" : "Y",
                        "active" : false
                }, {
                        "letter" : "Z",
                        "active" : false
                }, {
                        "letter" : "#",
                        "active" : false
                }]),
                // a store to act as model for the list UI
                connections = new Store([]), allConnections = [], selectMode = "view",
                //list can be used to browse contacts or to add them to groups or perform other actions

                
                /**
                 * A function to compare two contacts (single of groups)
                 * @param {Object} contact 1
                 * @param {Object} contact 2
                 * @returns {Number} -1 or 1
                 */
                compareContacts = function(x,y){
                        var _x, _y, _xfn, _yfn;
                        (x.lastname.substring(0, 1) == "#") ? _x = x.lastname.substring(1).toLowerCase() : _x = x.lastname.toLowerCase();
                        (y.lastname.substring(0, 1) == "#") ? _y = y.lastname.substring(1).toLowerCase() : _y = y.lastname.toLowerCase();
                        if (_x < _y) {return -1;}
                        else {
                                if (_x > _y) {return 1;}
                                else {
                                        _xfn = x.firstname.toLowerCase();
                                        _yfn = y.firstname.toLowerCase();
                                        if (_xfn < _yfn) {return -1;}
                                        else if (_xfn > _yfn) {return 1;}
                                        else {return 0;}
                                }
                        }
                },
                
                /*
                 * A function to delete a group in the user document (localstore and couchdb)
                 */
                deleteGroup = function(name) {
                        arr = userCDB.get("groups").concat();
                        for ( i = 0, l = arr.length; i < l; i++) {
                                if (arr[i].lastname.toLowerCase() == name.toLowerCase()) {
                                        arr.splice(i, 1);
                                }
                        }
                        // upload user document in database
                        userCDB.set("groups", arr);

                        userCDB.upload().then(function() {
                                // refresh contact list
                                getAllContacts();
                                // show first contact or display intro
                                (connections.getNbItems() && connections.get(0)) ? selectContact(0) : cObserver.notify("show-addcontact");
                        });
                },

                /*
                 * A function to remove a contact from the list of connections
                 * Updates couchDB
                 * Notifies the other end that the connection is interrupted
                 */
                deleteContact = function(userid) {
                        console.log(userid);
                        // notify the other end
                        var transport = Config.get("Transport"), json = {
                                "dest" : userid,
                                "author" : userCDB.get("_id"),
                                "username" : userCDB.get("username"),
                                "picture_file" : userCDB.get("picture_file"),
                                "type" : "cancel"
                        }, arr = [], grp=[], group=[];
                        transport.request("CxEvent", json, function(result) {
                                if (result !== "ok") {
                                        console.log("need to handle errors here");
                                } else {
                                        console.log("deleted contact notified");
                                }
                        });
                        if (userCDB.get("connections")[0]) {arr = userCDB.get("connections").concat();}
                        
                        // delete contact from connection list in user doc
                        for ( i = arr.length-1; i >= 0; i--) {
                                if (arr[i].userid === userid) {
                                        arr.splice(i, 1);
                                }
                        }
                        // update user document
                        userCDB.set("connections", arr);
                        
                        // check if contact was part of a group -- if yes delete contact in group as well
                        if (userCDB.get("groups") && userCDB.get("groups")[0]) {
                                
                                grp = userCDB.get("groups");
                                for (i=grp.length-1; i>=0; i--){
                                        group = grp[i].contacts;
                                        for (j=group.length-1; j>=0; j--){
                                                if (group[j].userid === userid) {
                                                        // if userid is found delete this contact entry
                                                        group.splice(j, 1);
                                                        // if group is empty remove the entire group
                                                        if (!group.length){
                                                             grp.splice(i,1);   
                                                        }
                                                }
                                        }  
                                }
                                userCDB.set("groups", grp);
                        }
                        
                        // update display
                        userCDB.upload().then(function() {
                                // refresh contact list
                                getAllContacts();

                                // show first contact if any (group or individual) or display intro
                                (userCDB.get("connections")[0]) ? selectContact(0) : cObserver.notify("show-addcontact");
                        });

                }, displayIndex = function(id){
                        var ln;
                        // check if this letter is not already selected
                        if (!index.get(id).active) {
                                // change style of selected letter
                                index.loop(function(value, idx) {
                                        (idx === id) ? index.update(idx, "active", true) : index.update(idx, "active", false);
                                });
                                // reset contact list
                                connections.reset([]);

                                // create matching pattern (starting with index letter uppercase or lowercase)
                                var pattern;
                                if (index.get(id).letter === "#"){
                                        pattern = /^[^a-zA-Z]/;
                                }
                                else {
                                        pattern = new RegExp("^" + index.get(id).letter,"i");        
                                }

                                // search all Connections for last names matching pattern
                                for ( i = 0, l = allConnections.length; i < l; i++) {
                                        ln = allConnections[i].lastname;
                                        if (ln.substring(0,1) === "#") {
                                                ln = ln.substring(1);
                                        }
                                        
                                        if (pattern.test(ln)) {
                                                connections.alter("push", allConnections[i]);
                                                // allConnections should already be properly sorted here
                                        }
                                }
                                // if there are entries at the specified index, display first one of them
                                if (connections.get(0)){
                                        connections.update(0, "selected", true);
                                        cObserver.notify("contact-selected", connections.get(0), selectMode);
                                        (connections.get(0).lastname.substring(0, 1) == "#") ? cObserver.notify("show-groupdetails") : cObserver.notify("show-contactdetails");
                                } 
                                else {
                                cObserver.notify("show-addcontact");  
                                }
                        }                 
                },getAllContacts = function() {
                        var i=-1;
                        // get sorted contact list from database
                        updateContactList();
                        // build contact store
                        // contact should not be displayed immediately unless all contacts are shown or it starts with the same letter as the selected index
                        if (document.getElementById("contactsearch") && document.getElementById("contactsearch").value.length > 0) {
                                searchContacts(document.getElementById("contactsearch").value);
                        }
                        index.loop(function(value, idx) {
                                if (value.active === true) {
                                        i = idx;
                                }
                        });
                        if (i >-1){
                                displayIndex(i);
                        }
                        else {
                                connections.reset(Utils.objectCopy(allConnections)); 
                                resetSelected();
                        }
                }, resetIndex = function() {
                        index.loop(function(value, idx) {
                                index.update(idx, "active", false);
                        });
                }, resetSelected = function() {
                        connections.loop(function(value, idx) {
                                connections.update(idx, "selected", false);
                        });
                }, searchContacts = function(query) {

                        // reset index
                        resetIndex();
                        resetSelected();
                        connections.reset([]);

                        // if query is empty display entire list
                        if (query == "")
                                connections.reset(allConnections);
                        else {
                                var pattern = new RegExp(query);
                                var lnMatches = [];
                                var fnMatches = [];

                                // search lastnames and firstnames --> return lastname matches first
                                for ( i = 0, l = allConnections.length; i < l; i++) {
                                        if (pattern.test(allConnections[i].lastname.toLowerCase()))
                                                lnMatches.push(allConnections[i]);
                                        else if (allConnections[i].firstname && pattern.test(allConnections[i].firstname.toLowerCase()))
                                                fnMatches.push(allConnections[i]);
                                };
                                // display results
                                connections.reset(lnMatches.concat(fnMatches));
                        };
                        // if selectMode is view, display contact details of first item in the list
                        if (selectMode == "view") {
                                if (connections.get(0)) {
                                        connections.update(0, "selected", true);
                                        cObserver.notify("contact-selected", connections.get(0), selectMode);
                                        (connections.get(0).lastname.substring(0, 1) == "#") ? cObserver.notify("show-groupdetails") : cObserver.notify("show-contactdetails");
                                } else
                                        cObserver.notify("show-addcontact");
                        }
                }, selectContact = function(id) {
                        if (selectMode == "view") {
                                (connections.get(id).lastname.substring(0, 1) == "#") ? cObserver.notify("show-groupdetails") : cObserver.notify("show-contactdetails");
                                resetSelected();
                                connections.update(id, "selected", true);
                        };
                        cObserver.notify("contact-selected", connections.get(id), selectMode);
                }, sortContacts = function(arr) {
                        arr.sort(compareContacts);
                }, updateContactList = function() {
                        // retrieve contacts from user document individual lists + groups
                        if (!userCDB.get("connections")){
                                userCDB.set("connections", []);
                                }
                        if (userCDB.get("connections")) {
                                (userCDB.get("groups")) ? allConnections = userCDB.get("connections").concat(userCDB.get("groups")) : allConnections = userCDB.get("connections").concat();
                        }
                        
                        // sort contact list
                        if (allConnections.length>1) {
                                sortContacts(allConnections);
                        }
                };

                ContactList.addContact = function(event, node) {

                        cObserver.notify("show-addcontact");

                };

                ContactList.addGroup = function(event, node) {

                        // create group: groupname, description, list of contacts (from existing user contacts)
                        cObserver.notify("show-groupdetails", "new");

                        // notify list that selected contacts should be added to the group (instead of being displayed)
                        cObserver.notify("select-mode", "add");

                };

                ContactList.deleteConnection = function(event, node) {

                        var idx = node.getAttribute("data-connection_id");

                        // delete entry from dislayed list
                        // connections.del(idx);
                        
                        //clear contact details
                        cObserver.notify("show-addcontact");

                        // check if connection is a group or a single contact and call appropriate function to remove contact from user document
                        (allConnections[idx].lastname.substring(0, 1) === "#") ? deleteGroup(allConnections[idx].lastname.toLowerCase()) : deleteContact(allConnections[idx].userid);

                };

                ContactList.search = function(event, node) {
                        event.stopPropagation();
                        // start search as soon as 3 characters are entered or if enter key is pressed
                        if ((node.value.length >= 3) || (event.keyCode == 13)) {
                                // search is done all in lowercase
                                searchContacts(node.value.toLowerCase());
                        };
                };

                ContactList.selectContact = function(event, node) {
                        selectContact(node.getAttribute("data-connection_id"));
                };

                ContactList.selectIndex = function(event, node) {
                        // clear search field
                        if (document.getElementById("contactsearch")){
                                document.getElementById("contactsearch").value = "";
                        }
                        displayIndex(node.getAttribute("data-index_id"));
                };

                ContactList.plugins.addAll({
                        "index" : new ModelPlugin(index, {
                                setActive : function(active) {
                                        (active) ? this.setAttribute("style", "font-weight:bold; color: black;") : this.setAttribute("style", "color: darkgray;");
                                }
                        }),
                        "connection" : new ModelPlugin(connections, {
                                setSelected : function(selected) {
                                        (selected) ? this.setAttribute("style", "background: white; font-weight: bold; font-family:Pacifico;") : this.setAttribute("style", "background: whitesmoke; font-weight: normal; font-family: helvetica;");
                                },
                                setVisible : function(selected) {
                                        (selected) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                },
                                formatName : function(name) {
                                        // check if contact is a group (lastname = #GROUPNAME, firstname = "")
                                        if (name) {
                                                (name.substring(0, 1) == "#") ? this.innerHTML = name.substring(1).toUpperCase() : this.innerHTML = name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase();
                                        } else
                                                this.innerHTML = "";
                                }
                        }),
                        "contactevent" : new EventPlugin(ContactList),
                        "searchevent" : new EventPlugin(ContactList)
                });

                // listen for events

                // notification that a contact request has been accepted
                cObserver.watch("contactreq-ok", function(contact) {
                        var arr = [];
                        if (userCDB.get("connections")[0]) {arr = userCDB.get("connections");}
                        arr.push(contact);
                        userCDB.set("connections", arr);
                        userCDB.upload();
                });

                // notification to change select mode (values are "view"/"add"/"select")
                cObserver.watch("select-mode", function(mode) {
                        selectMode = mode;
                });

                // notification that a new group has been added
                cObserver.watch("new-group", function(groupId) {
                        getAllContacts();
                        resetSelected();
                        connections.loop(function(value, idx) {
                                if (value.lastname == groupId)
                                        connections.update(idx, "selected", true);
                        });
                });

                // display all contacts in view mode and display first contact details
                cObserver.watch("show-allcontacts", function() {
                        
                        getAllContacts();
                        selectMode = "view";
                        //if connection list is not empty then show first contact of the list
                        if (connections.getNbItems() && connections.get(0)) {
                                connections.update(0, "selected", true);
                                cObserver.notify("contact-selected", connections.get(0), selectMode);
                                (connections.get(0).lastname.substring(0, 1) === "#") ? cObserver.notify("show-groupdetails") : cObserver.notify("show-contactdetails");
                        }
                        else cObserver.notify("show-addcontact");
                });

                // watch for changes in connections
                userCDB.watchValue("connections", function(){
                        getAllContacts();   
                });      

                // initialize
                cObserver.notify("show-allcontacts");

                ContactList.alive(Map.get("contactbox"));

                return ContactList;

        };
})
