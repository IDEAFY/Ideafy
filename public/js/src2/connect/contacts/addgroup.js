define("Ideafy/Connect/AddGroup", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "Ideafy/Avatar"],
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
                 selected = {},
                 user = Config.get("user"),
                 labels = Config.get("labels");
             
             
             addGroupUI.plugins.addAll({
                     "label" : new Model(labels),
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
                                        this.setAttribute("style", "background: url('../img/connect/"+value+"') no-repeat top left; background-size: contain;");
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
                     "addgrpevent" : new Event(addGroupUI)
             });
             
             addGroupUI.template = '<div id="addgroup"><div class="header blue-dark"><span class="newfolderlbl" data-label="bind:innerHTML, newcontactlbl"></span></div><div class = "detail-contents"><div class="folderpic" data-group="bind: setColor, color"></div><form><p><input type="text" class="input" data-group="bind:value, username" data-label="bind:placeholder, groupnamelbl"></p><p><textarea class="input" data-group="bind:value, intro" data-label="bind:placeholder, groupdesclbl"></textarea></p><legend data-label="bind:innerHTML, colortouch"></legend><ul class="groupcolors" data-color="foreach"><li data-color="bind:setColor, color; bind:setSelected, selected" data-addgrpevent="listen: touchstart, selectColor"></li></ul></form><div class = "contactlist invisible" data-search="bind: setVisible, display"><legend data-label="bind:innerHTML, selectcontact"></legend><ul data-contacts="foreach"><li class = "contact list-item"><div data-contacts="bind:setAvatar, value.userid"></div><p class="contact-name" data-contacts="bind:innerHTML, value.username"></p><p class="contact-intro" data-contacts="bind:innerHTML, value.intro"></p><div class="select-contact" data-searchdbevent="listen:touchstart, check"></div></li></ul><textarea class="input" data-label="bind:placeholder, addamessage" data-search="bind:value, message"></textarea><div class="addcontactbtns"><div class="addct" data-searchdbevent="listen:touchstart, press; listen:touchend, add"></div><div class="cancelct" data-searchdbevent="listen:touchstart, press; listen:touchend, cancel"></div></div></div></div>';
             
             addGroupUI.init = function init(){       
             };
             
             addGroupUI.selectColor = function(event, node){
                var id = node.getAttribute("data-color_id");
                colors.loop(function(v,i){
                        colors.update(i, "selected", false);
                });
                colors.update(id, "selected", true);
                group.set("color", colors.get(id).icon);
             };
             
             addGroupUI.searchDB = function (event, node){
                     var field;
                     if (event.keyCode === 13){
                               // validate search
                               event.target.blur();
                               console.log(event.target);
                               field = node.getAttribute("name");
                               validateSearch(field, node.value);
                     }        
             };
             
             addGroupUI.check = function(event,node){
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
             
             addGroupUI.reset = function reset(){
                group.reset({"username": "", "intro": "", "type": "group", "color": "graygroup.png", "contacts": [] });
                displayContacts.reset([]);       
             };
             
             addGroupUI.press = function(event, node){
                node.classList.add("pushed");        
             };
             
             addGroupUI.cancel = function(event, node){
                     node.classList.remove("pushed");
                     addGroupUI.reset();        
             };
             
             addGroupUI.add = function(event, node){
                
                node.classList.remove("pushed");
                // add selected contact(s)
                for (i in Object.keys(selected)){
                        addContact(displayContacts.get(i).value);                
                }
             };
             
             addGroupUI.init();
             
             return addGroupUI;
                   
           };   
        });
