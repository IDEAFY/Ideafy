define("Ideafy/Connect/AddContact", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "Store", "Ideafy/Avatar"],
        function(Widget, Config, Model, Event, CouchDBStore, Store, Avatar){
                
           return function AddContactConstructor(){
                   
             var addContactUI = new Widget(),
                 count = new CouchDBStore(),
                 search = new Store({"email":"", "firstname":"", "lastname":"", "result":"", "display": false, "sentok": false, "message":""}),
                 displayContacts = new Store([]),
                 selected = {},
                 user = Config.get("user"),
                 transport = Config.get("transport"),
                 labels = Config.get("labels"),
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
                         var cdb = new CouchDBStore();
                         cdb.setTransport(transport);
                         if (type === "userid"){
                                cdb.sync(Config.get("db"), "users", "_view/searchbyid", {key: '"'+value+'"', descending: true}).then(function(){
                                        displayContacts.reset(JSON.parse(cdb.toJSON()));
                                        (displayContacts.getNbItems()) ? search.set("display", true) : search.set("result", labels.get("noentryfound"));
                                        cdb.unsync();
                                });        
                         }
                         else{
                                cdb.sync(Config.get("db"), "users", "_view/searchbyusername", {key: '"'+value+'"', descending: true}).then(function(){
                                        displayContacts.reset(JSON.parse(cdb.toJSON()));
                                        (displayContacts.getNbItems()) ? search.set("display", true) : search.set("result", labels.get("noentryfound"));
                                        cdb.unsync();
                                });        
                         }
                 },
                 validateContactRequest = function(contact){
                         var res = false, sent = user.get("sentMessages"), sentCXR = false;
                        // verify if it is an existing contact
                        if (contact.userid === user.get("_id")) search.set("result", labels.get("cannotaddself"));
                        else if (JSON.stringify(user.get("connections")).search(contact.userid) > -1){
                                search.set("result", contact.username+labels.get("alreadyconnected"));        
                        }
                        // or if a request has been made in the last 30 days
                        else {
                                for(i=0;i<sent.length;i++){
                                        console.log(sent[i]);
                                        if (sent[i].type ==="CXR" && sent[i].toList.search(contact.username)>-1){
                                                sentCXR = true;        
                                        }
                                }
                                (sentCXR) ? search.set("result", labels.get("alreadysentCXR")+contact.username) : res = true;
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
                                        var result = JSON.parse(result);
                                        if (result[0].res === "ok") search.set("result", labels.get("CXRsent"));
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
                                     (sentok) ? this.setAttribute("style", "color: #5F8F28;"):this.setAttribute("style", "color: #F27B3D;")
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
                     "searchdbevent" : new Event(addContactUI)
             });
             
             addContactUI.template = '<div id="addcontact"><div class="header blue-dark"><span class="newcontactlbl" data-label="bind:innerHTML, newcontactlbl"></span></div><div class = "detail-contents"><div class="doctor-deedee"></div><div class="addcontactform"><p class="half"><span data-label="bind:innerHTML, beforecount"></span><strong><span data-count="bind:innerHTML, 0.value"></span></strong><span data-label="bind:innerHTML, aftercount"></span></p><p class="half" data-label="bind: innerHTML, addcontactrightintro"></p><legend data-label="bind:innerHTML, addcontactnow"></legend><input class="search" type="text" name="email" data-label="bind:placeholder, searchcontactplaceholder" data-search="bind: value, email" data-searchdbevent="listen: keypress, searchDB"><legend data-label="bind:innerHTML, lookup"></legend><div class="searchcontact"><input type="text" class="search half" name="fn" data-label="bind:placeholder, firstnameplaceholder" data-search="bind: value, firstname" data-searchdbevent="listen: keypress, searchDB"><input class="search half right" type="text" name="ln" data-label="bind: placeholder, lastnameplaceholder" data-search="bind: value, lastname" data-searchdbevent="listen: keypress, searchDB"></div><p class="searchresult" data-search="bind: innerHTML, result; bind:setStyle, sentok"></p></div></div><div class = "contactlist invisible" data-search="bind: setVisible, display"><legend data-label="bind:innerHTML, selectcontact"></legend><ul data-contacts="foreach"><li class = "contact list-item"><div data-contacts="bind:setAvatar, value.userid"></div><p class="contact-name" data-contacts="bind:innerHTML, value.username"></p><p class="contact-intro" data-contacts="bind:innerHTML, value.intro"></p><div class="select-contact" data-searchdbevent="listen:touchstart, check"></div></li></ul><textarea class="input" data-label="bind:placeholder, addamessage" data-search="bind:value, message"></textarea><div class="addcontactbtns"><div class="addct" data-searchdbevent="listen:touchstart, press; listen:touchend, add"></div><div class="cancelct" data-searchdbevent="listen:touchstart, press; listen:touchend, cancel"></div></div></div></div>';
             
             addContactUI.init = function init(){
                count.setTransport(transport);
                count.sync(Config.get("db"), "users", "_view/count").then(function(){console.log(count.toJSON())});        
             };
             
             addContactUI.searchDB = function (event, node){
                     var field;
                     if (event.keyCode === 13){
                               // validate search
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
                search.reset({"email":"", "firstname":"", "lastname":"", "result":"", "display": false, "sentok": false, "message":""});
                displayContacts.reset([]);       
             };
             
             addContactUI.press = function(event, node){
                node.classList.add("pushed");        
             };
             
             addContactUI.cancel = function(event, node){
                     node.classList.remove("pushed");
                     addContactUI.reset();        
             };
             
             addContactUI.add = function(event, node){
                
                node.classList.remove("pushed");
                // add selected contact(s)
                for (i in Object.keys(selected)){
                        addContact(displayContacts.get(i).value);                
                }
             };
             
             addContactUI.init();
             
             return addContactUI;
                   
           };   
        });
