define ("Ideafy/Connect/Contacts", ["Olives/OObject", "Map", "Config", "Amy/Stack-plugin", "Olives/Model-plugin", "Olives/Event-plugin", "Amy/Control-plugin", "Store", "Ideafy/Avatar", "Ideafy/ActionBar"],
        function(Widget, Map, Config, Stack, Model, Event, Control, Store, Avatar, ActionBar){
                
                return function ContactsConstructor(){
                        
                        var contactsUI = new Widget(),
                            detailStack = new Stack(),
                            sortButtons = new Store([
                                    {"name": "all", "label": "allbtn", "selected": true},
                                    {"name": "users", "label": "usrbtn", "selected": false},
                                    {"name": "groups", "label": "grpbtn", "selected": false}
                            ]),
                            currentSort = 0,
                            contactList = new Store([]),
                            touchStart,
                            touchPoint,
                            display = false,
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
                                                var id = this.getAttribute("data-contact_id"), frag, ui;
                                                console.log(type);
                                                if (type === "group"){
                                                        if (this.hasChildNodes()) this.removeChild(this.firstChild);
                                                        this.setAttribute("style", "background: url('../img/connect/"+contactList.get(id).color+"') no-repeat center center; background-size: contain;display:block; width:40px; height:40px;float:left;");
                                                }
                                                else{
                                                    _frag = document.createDocumentFragment();
                                                    _ui = new Avatar([contactList.get(id).userid]);
                                                        _ui.place(_frag);
                                                        (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                                }
                                        }
                                }),
                                "contactdetailstack": detailStack,
                                "contactlistcontrol": new Control(contactsUI),
                                "contactlistevent": new Event(contactsUI)
                        });
                        
                        contactsUI.template = '<div id="connect-contacts"><div class="contacts list"><div class="header blue-light"><span data-label="bind: innerHTML, contactlistheadertitle">My Contacts</span><div class="option right" data-contactlistevent="listen: touchstart, plus"></div></div><ul class="selectors" data-sort = "foreach"><li class="sort-button" data-sort="bind: setLabel, label; bind:setSelected, selected, bind: name, name" data-contactlistevent="listen:touchstart, displaySort"></li></ul><input class="search" type="text" data-label="bind: placeholder, searchmsgplaceholder" data-contactlistevent="listen: keypress, search"><div class="contactlist overflow" data-contactlistcontrol="radio:li,selected,touchstart,selectContact"><ul data-contact="foreach"><li class="contact list-item"><div data-contact="bind:setAvatar, type"></div><p class="contact-name" data-contact="bind:innerHTML, username"></p><p class="contact-intro" data-contact="bind:innerHTML, intro"></p><div class="select-contact"></div></li></ul></div></div><div id="contact-detail" class="details" data-contactdetailstack="destination"></div></div>';
                        
                        contactsUI.place(Map.get("connect-contacts"));
                        
                        contactsUI.init = function init(){
                                contactList.reset(user.get("connections"));       
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
                                touchStart = [event.pageX, event.pageY];
                                if (currentBar) this.hideActionBar(currentBar);  // hide previous action bar 
                        };
                
                        contactsUI.showActionBar = function(event, node){
                                var id = node.getAttribute("data-listideas_id");
                                touchPoint = [event.pageX, event.pageY];
                                if (!display && (touchStart[0]-touchPoint[0]) > 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                        var actionBar = new ActionBar("contact", node, contactList.get(id), this.hideActionBar),
                                           frag = document.createDocumentFragment();  
                                
                                        actionBar.place(frag); // render action bar    
                                        node.appendChild(frag); // display action bar
                                        currentBar = actionBar; // store current action bar
                                        display = true; // prevent from showing it multiple times
                                }
                        };
                
                        contactsUI.hideActionBar = function hideActionBar(ui){
                                var parent = ui.dom.parentElement;
                                parent.removeChild(parent.lastChild);
                                display = false;
                                currentBar = null;
                        };
                        
                        // initialize
                        // get message list from user document
                        contactsUI.init();
                        /*
                        // add UIs to detail stack
                        detailStack.getStack().add("#contactdetail", contactDetail);
                        detailStack.getStack().add("#addcontact", addContact);
                        // show add Contact page by default
                        detailStack.getStack().show("#addContact");
                        */
                        
                        return contactsUI;    
                }
        })
