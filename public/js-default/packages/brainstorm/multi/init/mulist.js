/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "Bind.plugin", "Event.plugin", "CouchDBView", "service/config", "Promise", "Store", "service/utils", "lib/spin.min", "Place.plugin", "./mupreview", "service/utils"],
        function(Widget, Model, Event, CouchDBView, Config, Promise, Store, Utils, Spinner, UIPlugin, MUPreview, Utils){
                
           return function MuListConstructor($exit){
           
                var widget = new Widget(),
                    labels=Config.get("labels"),
                    user = Config.get("user"),
                    db = Config.get("db"),
                    transport = Config.get("transport"),
                    muListAll = new Store([]),
                    muSearch = new Store([]),
                    muPreviewUI = new MUPreview(),
                    musessions = new Store([]),
                    muListOptions = new Store({"modes":["allmodes", "roulette", "campfire", "boardroom"], "selectedLang": "all", "selectedMode": "allmodes"}),
                    _languages = new Store([{name:"*"}]),
                    _usrLg = Config.get("userLanguages"),
                    currentList = "mulistall",
                    contacts, // array of user names
                    spinner = new Spinner({color:"#9AC9CD", lines:10, length: 10, width: 6, radius:10, top: 200}).spin();
                
                // build languages & flags
                _usrLg.forEach(function(val){
                        _languages.alter("push", val);
                });
                
                widget.plugins.addAll({
                        "labels" : new Model(labels),
                        "options" : new Model(muListOptions,{
                                setBg : function(lang){
                                        if (lang === "all"){
                                                this.setAttribute("style", "background-image: none;");
                                                this.innerHTML = "*";
                                        }
                                        else{
                                                this.innerHTML = " ";
                                                this.setAttribute("style", "background-image:url('img/flags/"+lang+".png');");
                                        }
                                },
                                setMode : function(modes){
                                        var i,l, res="";
                                        for (i=0, l=modes.length;i<l;i++){
                                                res+='<option>'+labels.get(modes[i])+'</option>';
                                        }
                                        this.innerHTML=res;        
                                }
                        }),
                        "select" : new Model (_languages, {
                                setBg : function(name){
                                        if (name === "*"){
                                                        this.setAttribute('style', "background-image: none;background: whitesmoke;text-align: center;");
                                                        this.innerHTML="*";
                                        }
                                        else{
                                                this.innerHTML = " ";
                                                this.setAttribute("style", "background-image:url('img/flags/"+name+".png');");
                                        }
                                } 
                        }),
                        "muall" : new Model(muListAll, {
                                setParticipants : function (array){
                                        var length = array.length + 1, i, res = '<ul>';
                                        for (i=0; i<length; i++){
                                                res+='<li></li>';
                                        }
                                        res+='</ul>';
                                        this.innerHTML = res;
                                },
                                setMode : function(mode){
                                        switch(mode){
                                                case "campfire":
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/campfire-orange.png');");
                                                        break;
                                                case "boardroom":
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/boardroom.png');");
                                                        break;
                                                default:
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/roulette-green.png');");
                                                        break;        
                                        }
                                },
                                setDate : function(scheduled){
                                        var now, sched;
                                        if (scheduled){
                                                now = new Date();
                                                sched = new Date(scheduled);
                                                if (now.toDateString() === sched.toDateString()){
                                                        if ((sched.getTime() - now.getTime()) <= 300000) this.innerHTML = labels.get("now");
                                                        else this.innerHTML = sched.toLocaleTimeString();
                                                }
                                                else {
                                                        this.innerHTML = Utils.formatDate([sched.getFullYear(), sched.getMonth(), sched.getDate()]);
                                                }       
                                        }
                                        else this.innerHTML = labels.get("now"); 
                                },
                                setLang : function(lang){
                                        this.setAttribute("style", "background-image: url('img/flags/"+lang.substring(0,2)+".png');");
                                        this.innerHTML = " ";
                                }
                        }),
                        "musearch" : new Model(muSearch, {
                                setParticipants : function (nb){
                                        var length = parseInt(nb,10) + 1, i, res = '<ul>';
                                        for (i=0; i<length; i++){
                                                res+='<li></li>';
                                        }
                                        res+='</ul>';
                                        this.innerHTML = res;
                                },
                                setMode : function(mode){
                                        switch(mode){
                                                case "campfire":
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/campfire-orange.png');");
                                                        break;
                                                case "boardroom":
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/boardroom.png');");
                                                        break;
                                                default:
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/roulette-green.png');");
                                                        break;        
                                        }        
                                },
                                setDate : function(scheduled){
                                        // couchdb-lucene fields returned as string -- convert to number first
                                        scheduled = parseInt(scheduled, 10);
                                        var now, sched;
                                        if (scheduled){
                                                now = new Date();
                                                sched = new Date(scheduled);
                                                if (now.toDateString() === sched.toDateString()){
                                                        if ((sched.getTime() - now.getTime()) <= 300000) this.innerHTML = labels.get("now");
                                                        else this.innerHTML = sched.toLocaleTimeString();
                                                }
                                                else {
                                                        this.innerHTML = Utils.formatDate([sched.getFullYear(), sched.getMonth(), sched.getDate()]);
                                                }        
                                        }
                                        else this.innerHTML = labels.get("now"); 
                                },
                                setLang : function(lang){
                                        var l = lang.substring(0,2);
                                        this.setAttribute("style", "background-image:url('img/flags/"+l+".png');");
                                        this.innerHTML = " ";
                                }        
                        }),
                        "mupreview" : new UIPlugin({"preview": muPreviewUI}),
                        "mulistevent" : new Event(widget)
                });
                
                widget.template = '<div id="mulist"><div id="mulist-content"><div id="mulistspinner"></div><div data-mupreview = "place: preview"></div><legend data-labels="bind:innerHTML, selectsession"></legend><div class="mulistoptions"><input class="search" type="search" data-mulistevent="listen: keypress, search"><select class="modes" data-options="bind: setMode, modes" data-mulistevent="listen:change, filterMode"></select><div class="selectlang"><div data-options="bind:setBg, selectedLang"></div><button data-mulistevent = "listen:mouseup, displayLang"></button></div><ul class="langlist invisible" data-select="foreach"><li data-select="bind: setBg, name" data-mulistevent="listen: mouseup, filterLang"></li></ul></div><hr/><div class="mulistheader"><div class="mumode" data-labels="bind:innerHTML, mode"></div><div class="mutitle" data-labels="bind:innerHTML, title"></div><div class=mudate data-labels="bind:innerHTML, sbydate"></div><div class="mulang" data-labels="bind:innerHTML, lang"></div><div class="muleadername" data-labels="bind:innerHTML, leader"></div><div class="muparts" data-labels="bind:innerHTML, participants"></div></div><div class="noresult invisible" data-labels="bind:innerHTML, nosessionfound"></div><ul id="mulistall" data-muall="foreach"><li data-mulistevent="listen: mousedown, zoom"><div class="mumode" data-muall="bind:setMode, value.mode"></div><div class="mutitle" data-muall="bind:innerHTML, value.title">Title</div><div class="mudate" data-muall="bind:setDate, value.scheduled"></div><div class="mulang" data-muall="bind:setLang, value.lang"></div><div class="muleadername" data-muall="bind:innerHTML, value.initiator.username">Leader</div><div class="muparts" data-muall="bind: setParticipants, value.participants"></div></li></ul><ul id="musearch" class="invisible" data-musearch="foreach"><li data-mulistevent="listen: mousedown, zoom"><div class="mumode" data-musearch="bind:setMode, fields.mode"></div><div class="mutitle" data-musearch="bind:innerHTML, fields.title">Title</div><div class="mudate" data-musearch="bind:setDate, fields.scheduled"></div><div class="mulang" data-musearch="bind:setLang, fields.lang"></div><div class="muleadername" data-musearch="bind:innerHTML, fields.initiator">Leader</div><div class="muparts" data-musearch="bind: setParticipants, fields.participants"></div></li></ul></div></div>';
                
                widget.reset = function reset(){
                       currentList = "mulistall";
                       // init spinner
                       spinner.spin(widget.dom.querySelector("#mulistspinner"));
                       // reset options
                       muListOptions.set("selectedLang", "all");
                       muListOptions.set("selectedMode", "allmodes");
                       // synchronize list with database
                       widget.buildList(currentList).then(function(){
                                spinner.stop();
                        });
                };
                
                widget.buildList = function buildList(listId, query){
                        var arr = [], promise = new Promise();
                        if (listId === "mulistall"){
                                muListAll.reset([]);
                                widget.addSessions(arr, "roulette")
                                .then(function(){
                                        return widget.addSessions(arr, "campfire");
                                })
                                .then(function(){
                                        return widget.addSessions(arr, "boardroom");
                                })
                                .then(function(){
                                        if (arr.length){
                                                widget.dom.querySelector(".noresult").classList.add("invisible");
                                        }
                                        else {
                                                widget.dom.querySelector(".noresult").classList.remove("invisible");
                                        }
                                        muListAll.reset(arr);
                                        promise.fulfill();      
                                });  
                        }
                        if (listId === "musearch"){
                                muSearch.reset([]);
                                widget.syncSearch(arr, query).then(function(){
                                        if (arr.length){
                                                widget.dom.querySelector(".noresult").classList.add("invisible");
                                        }
                                        else {
                                                widget.dom.querySelector(".noresult").classList.remove("invisible");
                                        }
                                        muSearch.reset(arr);
                                        promise.fulfill();
                                });  
                        }
                        return promise;        
                };
                
                widget.syncSearch = function syncSearch(arr, query, filter){
                        var promise = new Promise(), cdb = new CouchDBView();
                        cdb.setTransport(transport);
                        cdb.sync("_fti/local/"+db, "indexedsessions", "waiting", {q: query, descending:true}).then(function(){
                                contacts = Utils.getContactUsernames().join();
                                cdb.loop(function(v,i){
                                        var add = false;
                                        if (v.fields.mode === "roulette" && v.score > 0.66){
                                                add = true;
                                        }
                                        else if (v.fields.mode === "campfire" && v.score > 0.66 && (v.fields.initiator === user.get("username") || contacts.search(v.fields.initiator) > -1)){
                                                add =true;
                                        }
                                        else if (v.fields.mode === "boardroom" && v.score > 0.66 && (v.fields.initiator === user.get("username") || v.fields.invited.search(user.get("_id"))>-1)){
                                                add = true;
                                        }
                                        if (add){
                                                if (!filter) {arr.push(v);}
                                                else{
                                                        if (v.fields.mode.search(filter.mode)>-1 && v.fields.lang.search(filter.lang)>-1) {arr.push(v);}
                                                }
                                        }
                                });
                                promise.fulfill();
                        }, function(err){
                                        alert(err);
                        });
                        return promise;        
                };
                
                // a function to add qualifying sessions (e.g. waiting, less than 4 participants and relevant to user)
                widget.addSessions = function addSessions(arr, mode, lang){
                        var promise = new Promise(),
                            cdb = new CouchDBView(),
                            view = "_view/"+mode, query = {};
                        
                        cdb.setTransport(transport);
                        if (mode === "roulette"){
                                (lang) ? query = {key:'"'+lang+'"', descending:false, limit:50} : query = {descending:false, limit:50};
                        }
                        else{
                                (lang) ? query={key: '["'+user.get("_id")+'","'+lang+'"]',descending:false} : query={startkey: '["'+user.get("_id")+'",{}]', endkey: '["'+user.get("_id")+'"]', descending:true};
                        }
                        cdb.sync(db, "library", view, query).then(function(){
                                cdb.loop(function(v,i){
                                        var now = new Date();
                                        // do not display sessions more than 15 min older than scheduled date
                                        if (!v.value.scheduled || ((now.getTime() - v.value.scheduled) <= 900000)) arr.unshift(v);
                                });
                                promise.fulfill();
                                cdb.unsync();
                        }, function(err){console.log(err, mode);});
                        return promise;
                };
                
                widget.search = function(event, node){
                        // reset previous search if any
                        if (event.keyCode === 13){
                                if (node.value === ""){
                                        widget.toggleList("mulistall");
                                }
                                else {
                                        widget.toggleList("musearch");
                                }
                        }        
                };
                
                widget.displayLang = function(event, node){
                        widget.dom.querySelector(".langlist").classList.remove("invisible");        
                };
                
                widget.filterLang = function(event, node){
                        var i = parseInt(node.getAttribute("data-select_id"), 10);
                        
                        widget.dom.querySelector(".langlist").classList.add("invisible");
                        
                        if (i === 0){
                                muListOptions.set("selectedLang", "all");       
                        }
                        else{
                                muListOptions.set("selectedLang", _languages.get(i).name);
                        }
                        // start spinner
                        spinner.spin(document.getElementById("mulistspinner"));
                        widget.filterList().then(function(){
                                spinner.stop();
                        });        
                };
                
                widget.filterMode = function(event, node){
                        var i = node.selectedIndex;
                        muListOptions.set("selectedMode", muListOptions.get("modes")[i]);
                        switch(i){
                                case 1:
                                        node.setAttribute("style", "color: #5F8F28;");
                                        break;
                                case 2:
                                        node.setAttribute("style", "color: #F27B3D");
                                        break;
                                case 3:
                                        node.setAttribute("style", "color: #4D4D4D;");
                                        break;
                                default:
                                        node.setAttribute("style", "color: black;");
                                        break;        
                        }
                        // start spinner
                        spinner.spin(document.getElementById("mulistspinner"));
                        widget.filterList().then(function(){
                                spinner.stop();
                        });
                };
                
                widget.filterList = function filterList($query){
                        var arr=[], query = $query || widget.dom.querySelector("#mulist-content input").value,
                            promise = new Promise(), mode = "", lang = "";
                        
                        // escape : characters in query - used in doc._id
                        query = query.replace(/:/g, '\\:');
                        
                        if (muListOptions.get("selectedMode") !== "allmodes"){mode = muListOptions.get("selectedMode");}
                        if (muListOptions.get("selectedLang") !== "all"){lang = muListOptions.get("selectedLang");}
                        
                        // if both filters have the default (all) value set simply refresh current list
                        if (mode === "" && lang === ""){
                                widget.buildList(currentList, query).then(function(){
                                        promise.fulfill();
                                });       
                        }
                        else{
                                // get current list and reset the store
                                if (currentList === "mulistall"){
                                        muListAll.reset([]);
                                        if (mode){
                                                widget.addSessions(arr, mode, lang).then(function(){
                                                        muListAll.reset(arr);
                                                        if (arr.length){
                                                                widget.dom.querySelector(".noresult").classList.add("invisible");
                                                        }
                                                        else {
                                                                widget.dom.querySelector(".noresult").classList.remove("invisible");
                                                        } 
                                                        promise.fulfill();      
                                                });
                                        }
                                        else{
                                                widget.addSessions(arr, "roulette", lang)
                                                .then(function(){
                                                        return widget.addSessions(arr, "campfire", lang);
                                                })
                                                .then(function(){
                                                        return widget.addSessions(arr, "boardroom", lang);
                                                })
                                                .then(function(){
                                                        muListAll.reset(arr);
                                                        if (arr.length){
                                                                widget.dom.querySelector(".noresult").classList.add("invisible");
                                                        }
                                                        else {
                                                                widget.dom.querySelector(".noresult").classList.remove("invisible");
                                                        }
                                                        promise.fulfill();      
                                                });
                                        }
                                }
                                else{
                                        muSearch.reset([]);
                                        widget.syncSearch(arr, query, {mode:mode, lang:lang}).then(function(){
                                                muSearch.reset(arr);
                                                if (arr.length){
                                                        widget.dom.querySelector(".noresult").classList.add("invisible");
                                                }
                                                else {
                                                        widget.dom.querySelector(".noresult").classList.remove("invisible");
                                                }
                                                promise.fulfill();        
                                        });
                                }
                        }
                        return promise;
                };
                
                widget.zoom = function(event, node){
                        var id;
                        node.classList.add("pressed");
                        if (currentList === "mulistall"){
                                id = parseInt(node.getAttribute("data-muall_id"), 10);
                                muPreviewUI.reset(muListAll.get(id).id);
                        }
                        else if (currentList === "musearch"){
                                id = node.getAttribute("data-musearch_id");
                                muPreviewUI.reset(muSearch.get(id).id);
                        }
                };
                
                widget.toggleList = function toggleList(list){
                        if (list !== currentList){
                                widget.dom.querySelector("#"+currentList).classList.add("invisible");
                                widget.dom.querySelector("#"+list).classList.remove("invisible");
                                currentList = list;
                        }
                        spinner.spin(widget.dom.querySelector("#mulistspinner"));
                        widget.filterList().then(function(){
                                spinner.stop();
                        });
                };
                
                widget.refreshList = function refreshList(){
                        if (!widget.dom.querySelector("#mulist-content input").value) currentList = "mulistall";
                        widget.toggleList(currentList);
                };
                
                widget.showPreview = function showPreview(id){
                        // display search window with session id
                        if (currentList !== "musearch"){
                                widget.dom.querySelector("#mulistall").classList.add("invisible");
                                widget.dom.querySelector("#musearch").classList.remove("invisible");
                                currentList = "musearch";
                        }
                        spinner.spin(widget.dom.querySelector("#mulistspinner"));
                        
                        widget.filterList(id).then(function(){
                                widget.dom.querySelector("#mulist-content input").value = muSearch.get(0).fields.title;
                                spinner.stop();
                        });
                        
                        // display pop up
                        muPreviewUI.reset(id);        
                };
                
                
                // init
                
                // pass the refresh callback to the preview UI to automatically refresh the current list once a preview window is closed
                muPreviewUI.init(widget.refreshList);
                   
                // watch for language change
                user.watchValue("lang", function(){
                        var arr;
                        muListOptions.set("modes", ["allmodes", "roulette", "campfire", "boardroom"]);
                        arr = muListOptions.get("lang");
                        arr.splice(0, 1, labels.get("all"));
                        muListOptions.set("lang", arr);     
                });
                
                // if a new scheduled session was created display it
                Config.get("observer").watch("show-session", function(session){
                        widget.dom.querySelector("#mulist-content input").value = session.get("title");
                        widget.toggleList("musearch");
                });
                
                // a session was exited - refresh the list
                Config.get('observer').watch("session-exited", function(){
                        widget.refreshList();
                });
                
                return widget;
                   
           };
});