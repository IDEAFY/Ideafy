/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "CouchDBStore", "service/config", "Promise", "Store", "service/utils", "lib/spin.min"],
        function(Widget, Model, Event, CouchDBStore, Config, Promise, Store, Utils, Spinner){
                
           return function MuListConstructor($exit){
           
                var widget = new Widget(),
                    muListAll = new Store([]),
                    muSearch = new Store([]),
                    musessions = new Store([]),
                    muListOptions = new Store({"lang":[], "modes":["allmodes", "roulette", "campfire", "boardroom"], "selectedLang": "all", "selectedMode": "allmodes"}),
                    currentList = "mulistall",
                    labels=Config.get("labels"),
                    user = Config.get("user"),
                    contacts = Utils.getUserContactIds(), // array of user ids
                    db = Config.get("db"),
                    transport = Config.get("transport"),
                    spinner = new Spinner({color:"#9AC9CD", lines:10, length: 10, width: 6, radius:10, top: 200}).spin();
                
                widget.plugins.addAll({
                        "labels" : new Model(labels),
                        "options" : new Model(muListOptions,{
                                setLang : function(lang){
                                        var i,l, res="";
                                        for (i=0, l=lang.length;i<l;i++){
                                                res+='<option>'+lang[i]+'</option>';
                                        }
                                        this.innerHTML=res;        
                                },
                                setMode : function(modes){
                                        var i,l, res="";
                                        for (i=0, l=modes.length;i<l;i++){
                                                res+='<option>'+labels.get(modes[i])+'</option>';
                                        }
                                        this.innerHTML=res;        
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
                                setLang : function(lang){
                                        switch(lang){
                                                case "fr-fr":
                                                        this.setAttribute("style", "background-image:url('img/flags/france.png');");
                                                        break;
                                                default:
                                                        this.setAttribute("style", "background-image:url('img/flags/USA.png');");
                                                        break;
                                        }
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
                                setLang : function(lang){
                                        switch(lang){
                                                case "fr-fr":
                                                        this.setAttribute("style", "background-image:url('img/flags/france.png');");
                                                        break;
                                                default:
                                                        this.setAttribute("style", "background-image:url('img/flags/USA.png');");
                                                        break;
                                                
                                        }
                                        this.innerHTML = " ";
                                }        
                        }),
                        "mulistevent" : new Event(widget)
                });
                
                widget.template = '<div id="mulist"><div id="mulist-content"><div id="mulistspinner"></div><div class="preview invisible"></div><legend data-labels="bind:innerHTML, selectsession"></legend><div class="mulistoptions"><input class="search" type="search" data-mulistevent="listen: keypress, search"><select class="modes" data-options="bind: setMode, modes" data-mulistevent="listen:change, filterMode"></select><select data-options="bind: setLang, lang" data-mulistevent="listen:change, filterLang"></select></div><hr/><div class="mulistheader"><div class="mumode" data-labels="bind:innerHTML, mode"></div><div class="mutitle" data-labels="bind:innerHTML, title"></div><div class="mulang" data-labels="bind:innerHTML, lang"></div><div class="muleadername" data-labels="bind:innerHTML, leader"></div><div class="muparts" data-labels="bind:innerHTML, participants"></div></div><div id="noresult" class="invisible" data-labels="bind:innerHTML, nosessionfound"></div><ul id="mulistall" data-muall="foreach"><li data-mulistevent="listen: touchstart, zoom"><div class="mumode" data-muall="bind:setMode, value.mode"></div><div class="mutitle" data-muall="bind:innerHTML, value.title">Title</div><div class="mulang" data-muall="bind:setLang, value.lang"></div><div class="muleadername" data-muall="bind:innerHTML, value.initiator.username">Leader</div><div class="muparts" data-muall="bind: setParticipants, value.participants"></div></li></ul><ul id="musearch" class="invisible" data-musearch="foreach"><li data-mulistevent="listen: touchstart, zoom"><div class="mumode" data-musearch="bind:setMode, fields.mode"></div><div class="mutitle" data-musearch="bind:innerHTML, fields.title">Title</div><div class="mulang" data-musearch="bind:setLang, fields.lang"></div><div class="muleadername" data-musearch="bind:innerHTML, fields.initiator">Leader</div><div class="muparts" data-musearch="bind: setParticipants, fields.participants"></div></li></ul></div></div>';
                
                widget.reset = function reset(){
                       currentList = "mulistall";
                       // init spinner
                       spinner.spin(document.getElementById("mulistspinner"));
                       // reset options
                       muListOptions.set("selectedLang", "all");
                       muListOptions.set("selectedMode", "allmodes");
                       // synchronize muCDB with database
                        widget.buildList(currentList).then(function(){
                                spinner.stop();
                        });
                };
                
                widget.buildList = function buildList(listId, query){
                        var arr = [], promise = new Promise();
                        if (listId === "mulistall"){
                                muListAll.reset([]);
                                widget.addSessions(arr, "roulette").then(function(){
                                        widget.addSessions(arr, "campfire").then(function(){
                                                widget.addSessions(arr, "boardroom").then(function(){
                                                        if (arr.length){
                                                                document.getElementById("noresult").classList.add("invisible");
                                                        }
                                                        else {
                                                                document.getElementById("noresult").classList.remove("invisible");
                                                        }
                                                        muListAll.reset(arr);
                                                        promise.fulfill();      
                                                }); 
                                        });   
                                });  
                        }
                        if (listId === "musearch"){
                                muSearch.reset([]);
                                widget.syncSearch(arr, query).then(function(){
                                        if (arr.length){
                                                document.getElementById("noresult").classList.add("invisible");
                                        }
                                        else {
                                                document.getElementById("noresult").classList.remove("invisible");
                                        }
                                        muSearch.reset(arr);
                                        promise.fulfill();
                                });  
                        }
                        return promise;        
                };
                
                widget.syncSearch = function syncSearch(arr, query, filter){
                        var promise = new Promise(), cdb = new CouchDBStore();
                        cdb.setTransport(transport);
                        cdb.sync("_fti/local/"+db, "indexedsessions", "waiting", {q: query, descending:true}).then(function(){
                                cdb.loop(function(v,i){
                                        var add = false;
                                        if (v.fields.mode === "roulette"){
                                                add = true;
                                        }
                                        else if (v.fields.mode === "campfire" && contacts.indexOf(v.fields.initiator.id) > -1){
                                                add =true;
                                        }
                                        else if (v.fields.mode === "boardroom" && v.fields.invited.search(user.get("_id"))>-1){
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
                        });
                        
                        return promise;        
                };
                
                // a function to add qualifying sessions (e.g. waiting, less than 4 participants and relevant to user)
                widget.addSessions = function addSessions(arr, mode, filter){
                        var promise = new Promise(),
                            cdb = new CouchDBStore(),
                            view = "_view/"+mode, query = {};
                        
                        cdb.setTransport(transport);
                        if (mode === "roulette"){
                                query = {descending:true, limit:50};
                        }
                        else{
                                query={key: Config.get("uid"),descending:false};      
                        }
                        cdb.sync(db, "library", view, query).then(function(){
                                if (mode === "roulette"){
                                        cdb.loop(function(v,i){
                                                if (!filter || v.value.lang.search(filter.lang) > -1) arr.push(v);        
                                        });
                                }
                                else {
                                        cdb.loop(function(v,i){
                                                if (!filter || v.value.lang.search(filter.lang) > -1) arr.unshift(v);        
                                        });        
                                }
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
                
                widget.filterLang = function(event, node){
                        var i = node.selectedIndex;
                        if (i === 0){
                                muListOptions.set("selectedLang", "all");        
                        }
                        else{
                                muListOptions.set("selectedLang", muListOptions.get("lang")[i]);
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
                
                widget.filterList = function filterList(){
                        var arr=[], query = document.getElementById("mulist-content").querySelector("input").value,
                            promise = new Promise(), mode = "", lang = "";
                        
                        if (muListOptions.get("selectedMode") !== "allmodes"){mode = muListOptions.get("selectedMode");}
                        if (muListOptions.get("selectedLang") !== "all"){lang = muListOptions.get("selectedLang");}
                        
                        console.log(mode, lang);
                        
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
                                                widget.addSessions(arr, mode, {lang: lang}).then(function(){
                                                        muListAll.reset(arr);
                                                        if (arr.length){
                                                                document.getElementById("noresult").classList.add("invisible");
                                                        }
                                                        else {
                                                                document.getElementById("noresult").classList.remove("invisible");
                                                        } 
                                                        promise.fulfill();      
                                                });
                                        }
                                        else{
                                                widget.addSessions(arr, "roulette", {lang: lang}).then(function(){
                                                        widget.addSessions(arr, "campfire", {lang: lang}).then(function(){
                                                                widget.addSessions(arr, "boardroom", {lang: lang}).then(function(){
                                                                        muListAll.reset(arr);
                                                                        if (arr.length){
                                                                                document.getElementById("noresult").classList.add("invisible");
                                                                        }
                                                                        else {
                                                                                document.getElementById("noresult").classList.remove("invisible");
                                                                        }
                                                                        promise.fulfill();      
                                                                }); 
                                                        });   
                                                });
                                        }
                                }
                                else{
                                        muSearch.reset([]);
                                        widget.syncSearch(arr, query, {mode:mode, lang:lang}).then(function(){
                                                muSearch.reset(arr);
                                                if (arr.length){
                                                        document.getElementById("noresult").classList.add("invisible");
                                                }
                                                else {
                                                        document.getElementById("noresult").classList.remove("invisible");
                                                }
                                                promise.fulfill();        
                                        });
                                }
                        }
                        return promise;
                };
                
                widget.zoom = function(event, node){
                        node.classList.add("pressed");        
                };
                
                widget.toggleList = function toggleList(list){
                        if (list !== currentList){
                                document.getElementById(currentList).classList.add("invisible");
                                document.getElementById(list).classList.remove("invisible");
                                currentList = list;
                        }
                        spinner.spin(document.getElementById("mulistspinner"));
                        widget.filterList().then(function(){
                                spinner.stop();
                        });
                };
                
                
                // init
                // get available languages
                transport.request("GetLanguages", {}, function(result){
                        muListOptions.set("lang", [labels.get("all")].concat(result));      
                });
                   
                // watch for language change
                user.watchValue("lang", function(){
                        var arr;
                        muListOptions.set("modes", ["allmodes", "roulette", "campfire", "boardroom"]);
                        arr = muListOptions.get("lang");
                        arr.splice(0, 1, labels.get("all"));
                        muListOptions.set("lang", arr);     
                });
                MUALL = muListAll;
                MUSEARCH = muSearch;
                MUOPTIONS = muListOptions;
                return widget;
                   
           };
});