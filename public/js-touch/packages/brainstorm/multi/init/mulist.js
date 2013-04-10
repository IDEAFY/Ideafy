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
                    muListOptions = new Store({"lang":[], "modes":["allmodes", "roulette", "campfire", "boardroom"], "selectedLang": "", "selectedMode": ""}),
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
                                },
                                setColor : function(mode){
                                        switch(mode){
                                                case "roulette":
                                                        this.setAttribute("style", "color: #5F8F28;");
                                                        break;
                                                case "campfire":
                                                        this.setAttribute("style", "color: #F27B3D;");
                                                        break;
                                                case "boardroom":
                                                        this.setAttribute("style", "color: #4D4D4D;");
                                                        break;
                                                default:
                                                        this.setAttribute("style", "color: black;");
                                                        break;        
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
                
                widget.template = '<div id="mulist"><div id="mulist-content"><div id="mulistspinner"></div><legend data-labels="bind:innerHTML, selectsession"></legend><div class="mulistoptions"><input class="search" type="search" data-mulistevent="listen: keypress, search"><select class="modes" data-options="bind: setMode, modes; binds: setColor, selectedMode" data-mulistevent="listen:change, filterMode"></select><select data-options="bind: setLang, lang" data-mulistevent="listen:change, filterLang"></select></div><hr/><div class="mulistheader"><div class="mumode">Mode</div><div class="mutitle">Title</div><div class="mulang">Lang</div><div class="muleadername">Session leader</div><div class="muparts">Participants</div></div><div id="noresult" class="invisible" data-labels="bind:innerHTML, nosessionfound"></div><ul id="mulistall" data-muall="foreach"><li data-mulistevent="listen: touchstart, zoom"><div class="mumode" data-muall="bind:setMode, value.mode"></div><div class="mutitle" data-muall="bind:innerHTML, value.title">Title</div><div class="mulang" data-muall="bind:setLang, value.lang"></div><div class="muleadername" data-muall="bind:innerHTML, value.initiator.username">Leader</div><div class="muparts" data-muall="bind: setParticipants, value.participants"></div></li></ul><ul id="musort" class="invisible"></ul><ul id="musearch" class="invisible" data-musearch="foreach"><li data-mulistevent="listen: touchstart, zoom"><div class="mumode" data-musearch="bind:setMode, fields.mode"></div><div class="mutitle" data-musearch="bind:innerHTML, fields.title">Title</div><div class="mulang" data-musearch="bind:setLang, fields.lang"></div><div class="muleadername" data-musearch="bind:innerHTML, fields.initiator">Leader</div><div class="muparts" data-musearch="bind: setParticipants, fields.participants"></div></li></ul></div></div>';
                
                widget.reset = function reset(){
                       currentList = "mulistall";
                       // init spinner
                       spinner.spin(document.getElementById("mulistspinner")); 
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
                
                widget.syncSearch = function syncSearch(arr, query){
                        var promise = new Promise(), cdb = new CouchDBStore();
                        cdb.setTransport(transport);
                        cdb.sync("_fti/local/"+db, "indexedsessions", "waiting", {q: query, descending:true}).then(function(){
                                cdb.loop(function(v,i){
                                        console.log(v);
                                        if (v.fields.mode === "roulette"){
                                                arr.push(v);
                                        }
                                        else if (v.fields.mode === "campfire" && contacts.indexOf(v.fields.initiator.id) > -1){
                                                arr.push(v);
                                        }
                                        else if (v.fields.mode === "boardroom" && v.fields.invited.search(user.get("_id"))>-1){
                                                arr.push(v);
                                        }
                                });
                                promise.fulfill();
                        });
                        
                        return promise;        
                };
                
                // a function to add qualifying sessions (e.g. waiting, less than 4 participants and relevant to user)
                widget.addSessions = function addSessions(arr, mode){
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
                                                arr.push(v);        
                                        });
                                }
                                else {
                                        cdb.loop(function(v,i){
                                                arr.unshift(v);        
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
                                        widget.toggleList("musearch", node.value);
                                }
                        }        
                };
                
                widget.filterLang = function(event, node){
                        
                };
                
                widget.fileterMode = function(event, node){
                        
                };
                
                widget.zoom = function(event, node){
                        node.classList.add("pressed");        
                };
                
                widget.toggleList = function toggleList(list, query){
                        if (list !== currentList){
                                document.getElementById(currentList).classList.add("invisible");
                                document.getElementById(list).classList.remove("invisible");
                                currentList = list;
                        }
                        spinner.spin(document.getElementById("mulistspinner"));
                        widget.buildList(list, query).then(function(){
                                spinner.stop();
                        });
                };
                
                
                // init
                // get available languages
                   transport.request("GetLanguages", {}, function(result){
                        muListOptions.set("lang", ["all"].concat(result));      
                   });
                MUALL = muListAll;
                MUSEARCH = muSearch;
                return widget;
                   
           };
});