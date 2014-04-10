/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "service/config", "Bind.plugin", "Place.plugin", "Amy/Delegate-plugin", "Amy/Stack-plugin", "Amy/Control-plugin", "./mtc-stack", "./twoqlist", "Store"],
        function(Widget, Map, Config, Model, UIPlugin, Delegate, Stack, Control, MTCDetailStack, TwoQList, Store){
                
                return function MyTwocentsConstructor(){
                        
                        var myTwocentUI = new Widget(),
                            mtcStack = new Stack(),
                            mtcControl = new Control(myTwocentUI),
                            mtcDetails = new MTCDetailStack(),
                            mytwoq, contacttwoq,
                            btns=[
                                {name: "#mytwoq", active: true},
                                {name: "#contacttwoq", active: false},
                                {name: "#mytwoc", active: false}
                            ],
                            twoQButtons = new Store(btns),
                            mtcTools = new Store({"view": "#mytwoq"}),
                            contactList = new Store([]),
                            user = Config.get("user"),
                            connections = user.get("connections"),
                            labels = Config.get("labels"),
                            db = Config.get("db");
                            
                        myTwocentUI.plugins.addAll({
                                "labels" : new Model(labels),
                                "twoqbuttons" : new Model(twoQButtons,{
                                        setBg : function(name){
                                                switch(name){
                                                        case "#mytwoq":
                                                                this.classList.add("mytwoq");
                                                                break;
                                                        case "#contacttwoq":
                                                                this.classList.add("contacttwoq");
                                                                break;
                                                        case "#mytwoc":
                                                                this.classList.add("mytwoc");
                                                                break;
                                                        default:
                                                                break;
                                                }        
                                        },
                                        setActive : function(active){
                                                (active)?this.classList.add("pushed"):this.classList.remove("pushed");
                                        }
                                        }),
                                "mtctools" : new Model(mtcTools, {
                                        setVisible : function(view){
                                                (this.getAttribute("name")===view) ? this.classList.remove("invisible"):this.classList.add("invisible");
                                        },
                                        setLegend : function(view){
                                                switch(view){
                                                        case "#mytwoq":
                                                                this.innerHTML = labels.get("mytwoquestions");
                                                                break;
                                                        case "#contacttwoq":
                                                                this.classList.add("contacttwoq");
                                                                break;
                                                        case "#mytwoc":
                                                                this.innerHTML = labels.get("mytwocents");
                                                                break;
                                                        default:
                                                                break;        
                                                }
                                        },
                                        updateLegend : function(contact){
                                                if(contact && mtcTools.get("view") === "#contacttwoq") {
                                                        this.innerHTML = labels.get("twoqprefix")+contact+labels.get("twoqsuffix");
                                                }       
                                        }
                                }),
                                "auto" : new Model(contactList),
                                "mtcliststack" : mtcStack,
                                "mtcdetails" : new UIPlugin({"mtcDetails" : mtcDetails}),
                                "mtccontrol" : mtcControl,
                                "mtcevent" : new Delegate(myTwocentUI)
                        });    
                        
                        myTwocentUI.template = '<div id="connect-tc"><div id="mtc-list"><div class="header blue-light"><span data-labels="bind: innerHTML, mtcheadertitle"></span><div class="option right" data-mtcevent="listen: touchstart, plus"></div></div><ul class="twoqbuttons" data-twoqbuttons="foreach"><li data-twoqbuttons="bind: setBg,name; bind:setActive, active" data-mtcevent="listen:touchstart, selectView; listen: touchend, showView"></li></ul><div class="selectcontact" name = "#contacttwoq" data-mtctools="bind:setVisible, view"><legend>Select a contact</legend><input class="search" data-mtcevent="listen:touchstart, updateAutoContact; listen:keyup, updateAutoContact" data-labels="bind:placeholder, tocontactlbl" data-mtctools = "bind:value, contact"><div class="rightcaret" data-mtcevent="listen: touchstart, updateAutoContact"></div><div class = "autocontact invisible"><ul data-auto="foreach"><li data-auto="bind:innerHTML, contact.username; bind:highlight, selected" data-mtcevent="listen:touchstart, highlightContact; listen:touchend, selectContact"></li></ul></div></div><legend data-mtctools="bind:setLegend, view; bind: updateLegend, contact"></legend><input name="#mytwoq" class="search" type="text" data-mtctools="bind:setVisible, view" data-labels="bind: placeholder, searchmsgplaceholder" data-mtcevent="listen: input, search"><input name="#contacttwoq" class="search" type="text" data-mtctools="bind:setVisible, view" data-labels="bind: placeholder, searchmsgplaceholder" data-mtcevent="listen: keypress, search"><input name="#mytwoc" class="search" type="text" data-mtctools="bind:setVisible, view" data-labels="bind: placeholder, searchmsgplaceholder" data-mtcevent="listen: keypress, search"><div data-mtcliststack="destination" data-mtccontrol="radio:li,selected,touchstart,selectStart"></div></div><div id="mtc-detail" data-mtcdetails="place:mtcDetails" class="details"></div></div>';
                        
                        myTwocentUI.place(Map.get("connect-twocents"));
                        
                        // ask a twoquestion
                        myTwocentUI.plus = function(){
                                Map.get("new2q-popup").classList.add("appear");
                                Map.get("cache").classList.add("appear");        
                        };
                        
                        // manage button events
                        myTwocentUI.selectView = function(event, node){
                                var id = node.getAttribute("data-twoqbuttons_id");
                                twoQButtons.loop(function(v,i){
                                        (i===parseInt(id)) ? twoQButtons.update(i, "active", true) : twoQButtons.update(i, "active", false);        
                                });
                                mtcTools.set("view", twoQButtons.get(id).name);
                        };
                        
                        // switch between twocent views
                        myTwocentUI.showView = function(event, node){
                                var id = node.getAttribute("data-twoqbuttons_id");
                                
                                switch(twoQButtons.get(id).name){
                                        case "#mytwoq":
                                                mtcStack.getStack().show("#mytwoq");
                                               // mtcDetails.setView("2Q");
                                               mtcDetails.setView("#defaultPage"); 
                                                break;
                                        case "#contacttwoq":
                                                mtcStack.getStack().show("#contacttwoq");
                                               // mtcDetails.setView("2Q");
                                               mtcDetails.setView("#defaultPage"); 
                                                break;
                                        case "#mytwoc":
                                                mtcStack.getStack().show("#blank");
                                                mtcDetails.setView("2C");
                                                break;
                                } 
                        };
                        
                        // update autocontact list
                        myTwocentUI.updateAutoContact = function(event, node){
                                var arr = JSON.parse(contactList.toJSON()), 
                                    clc, vlc, // lowercase conversion
                                    dom = document.getElementById("mtc-list"),
                                    auto = dom.querySelector(".autocontact");
                                
                                // display div if not present
                                if (auto.classList.contains("invisible")) auto.classList.remove("invisible");   
                                
                                // clear the search field if backspace is hit
                                if (event.keyCode === 8){node.value = "";}
                                
                                if (!node.value || node.value === ""){
                                        arr = [];
                                        //initialize contact list with all user contacts in user's document
                                        for(i=0, l =connections.length; i<l; i++){
                                                if (connections[i].type === "user") {
                                                arr.push({"contact":connections[i]});
                                                }       
                                        }
                                        contactList.reset(arr);
                                }
                                else{
                                        vlc = node.value.toLowerCase();
                                        for (i=arr.length-1; i>=0; i--){
                                                clc = arr[i].contact.username.toLowerCase();
                                                if (clc.search(vlc) !== 0) arr.splice(i, 1);
                                        }
                                        contactList.reset(arr);    
                                }
                                
                                // launch the query if user hits return
                                if (event.keyCode === 13){
                                        if (node.value === ""){
                                                mtcStack.getStack().show("#blank");
                                                mtcDetails.getStack().show("defaultPage");               
                                        }
                                        else{
                                                if (contactList.getNbItems()){
                                                        mtcTools.set("contact", contactList.get(0).contact.username);
                                                        contacttwoq.resetQuery({key: '"'+contactList.get(0).contact.userid+'"', descending: true}).then(function(){
                                                                var store = contacttwoq.getModel(),
                                                                    node;
                                                                if (store.getNbItems()){
                                                                        mtcStack.getStack().show("#contacttwoq");
                                                                        mtcDetails.reset("2Q", store.get(0));
                                                                        node = contacttwoq.dom.querySelector("li[data-twoqlist_id='0']");
                                                                        mtcControl.init(node);
                                                                        node.classList.add("selected");
                                                                        mtcDetails.reset("2Q", store.get(0));
                                                                }
                                                                else{
                                                                        mtcStack.getStack().show("#blank");
                                                                        mtcDetails.reset("default");      
                                                                }
                                                        });        
                                                } 
                                                else{
                                                        mtcStack.getStack().show("#blank");
                                                        mtcDetails.reset("default");         
                                                } 
                                        }
                                }
                        };
                        
                        // Hightlight a selected contact
                        myTwocentUI.highlightContact = function(event, node){
                                node.classList.add("highlighted");
                        };
                        
                        // Actions taken when a contact is selected
                        myTwocentUI.selectContact = function(event, node){
                                var idx = node.getAttribute("data-auto_id"),
                                    dom = document.getElementById("mtc-list"),
                                    auto = dom.querySelector(".autocontact");;
                                //remove highlight
                                node.classList.remove("highlighted");
                                //add contact's user name to mtcTools store
                                mtcTools.set("contact", contactList.get(idx).contact.username);
                                // hide contact selection popup
                                auto.classList.add("invisible");
                                // fetch and display contact twoquestions
                                contacttwoq.resetQuery({key: '"'+contactList.get(idx).contact.userid+'"', descending: true}).then(function(){
                                        var store = contacttwoq.getModel(),
                                            node;
                                        if (store.getNbItems()){
                                                mtcStack.getStack().show("#contacttwoq");
                                                mtcDetails.reset("2Q", store.get(0));
                                                node = contacttwoq.dom.querySelector("li[data-twoqlist_id='0']");
                                                mtcControl.init(node);
                                                node.classList.add("selected");
                                                mtcDetails.reset("2Q", store.get(0));
                                        }
                                        else{
                                                mtcStack.getStack().show("#blank");
                                                mtcDetails.reset("default");         
                                        }
                                });
                        };
                        
                        myTwocentUI.selectStart = function(event, node){
                                var store = mtcStack.getStack().getCurrentScreen().getModel(),
                                    id;
                                if (mtcTools.get("view") === "#mytwoq" || mtcTools.get("view") === "#contacttwoq"){
                                        id = event.target.getAttribute("data-twoqlist_id") || event.target.getAttribute("data-twoqsearch_id");
                                        mtcDetails.reset("2Q", store.get(id));       
                                }      
                        };
                        
                        myTwocentUI.search = function(event, node){
                                mtcStack.getStack().getCurrentScreen().search(node.value);              
                        };
                        
                        myTwocentUI.reset = function reset(){
                                var i;
                                twoQButtons.reset(btns);
                                mtcTools.set("view", "#mytwoq");
                                //reset contactlist
                                contactList.reset([]);
                                connections = user.get("connections");
                                for (i=0, l=connections.length; i<l; i++){
                                        if (connections[i].type === "user") {
                                                contactList.alter("push", {"contact":connections[i], "selected":false});
                                        }
                                }
                                mytwoq.resetQuery({key: '"' + user.get("_id")+'"', descending: true})
                                .then(function(){
                                        mtcStack.getStack().show("#mytwoq");
                                        mtcDetails.reset("default");
                                });
                                        
                        };
                        
                        // Manage events
                        Config.get("observer").watch("display-twoq", function(id, userid){
                                contacttwoq.resetQuery({key: '"'+userid+'"', descending: true}).then(function(){
                                        var store = contacttwoq.getModel(), index, node;
                                        
                                        mtcStack.getStack().show("#contacttwoq");
                                        mtcTools.set("view", "#contacttwoq");
                                        
                                        // set active button
                                        twoQButtons.loop(function(v,i){
                                                (v.name === "#contacttwoq") ? twoQButtons.update(i, "active", true) : twoQButtons.update(i, "active", false);      
                                        });
                                        
                                        // search twoquestion index
                                        store.loop(function(v, i){
                                                if (v.id === id){
                                                        index = i;
                                                        mtcTools.set("contact", v.value.username);
                                                 }        
                                        });
                                        
                                        // get li element
                                        node = contacttwoq.dom.querySelector("li[data-twoqlist_id='"+index+"']")
                                        
                                        // hightlight item in the list
                                        mtcControl.init(node);
                                        node.classList.add("selected");
                                        
                                        // display twoquestion details
                                        mtcDetails.reset("2Q", store.get(index));        
                                });
                        });
                        
                        Config.get("observer").watch("display-twoc", function(){
                                mtcStack.getStack().show("#blank");
                                mtcTools.set("view", "#mytwoc");
                                // set active button
                                twoQButtons.loop(function(v,i){
                                        (v.name === "#mytwoc") ? twoQButtons.update(i, "active", true) : twoQButtons.update(i, "active", false);      
                                });
                                mtcDetails.setView("2C");       
                        });
                        
                        //INIT
                        
                        // init contactList
                        for (i=0, l=connections.length; i<l; i++){
                                if (connections[i].type === "user") contactList.alter("push", {"contact":connections[i], "selected":false});
                        }
                        
                        // add twocent and twoquestion lists to the stack
                        mytwoq = new TwoQList("user", db, "questions", "_view/questionsbyauthor", {key: '"' + user.get("_id")+'"', descending: true});
                        contacttwoq = new TwoQList("contact", db, "questions", "_view/questionsbyauthor", {key: '"Blank_List"', descending: true});
                        blank = new TwoQList("user", db, "questions", "_view/questionsbyauthor", {key: '"Blank_List"', descending: true});
                        
                        mtcStack.getStack().add("#mytwoq", mytwoq);
                        mtcStack.getStack().add("#contacttwoq", contacttwoq);
                        mtcStack.getStack().add("#blank", blank);
                        
                        contacttwoq.init();
                        blank.init();
                        // display twoQ list (default and init details with first item)
                        mytwoq.init().then(function(){
                                mtcStack.getStack().show("#mytwoq");
                                mtcDetails.init("default");
                        });
                        
                        return myTwocentUI;
                };
        });
