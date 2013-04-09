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
                    muListOptions = new Store(),
                    currentList = "mulistall",
                    labels=Config.get("labels"),
                    user = Config.get("user"),
                    db = Config.get("db"),
                    transport = Config.get("transport"),
                    spinner = new Spinner({color:"#9AC9CD", lines:10, length: 10, width: 8, radius:10, top: 200}).spin();
                
                widget.plugins.addAll({
                        "labels" : new Model(labels),
                        "muall" : new Model(muListAll, {
                                setParticipants : function (array){
                                        this.innerHTML = array.length + 1;
                                },
                                setMode : function(mode){
                                        switch(mode){
                                                case "campfire":
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/campfire.png');");
                                                        break;
                                                case "boardroom":
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/boardroom.png');");
                                                        break;
                                                default:
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/roulette.png');");
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
                                        this.innerHTML = parseInt(nb,10) + 1;
                                },
                                setMode : function(mode){
                                        switch(mode){
                                                case "campfire":
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/campfire.png');");
                                                        break;
                                                case "boardroom":
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/boardroom.png');");
                                                        break;
                                                default:
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/roulette.png');");
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
                
                widget.template = '<div id="mulist"><div id="mulist-content"><div id="mulistspinner"></div><legend data-labels="bind:innerHTML, selectsession"></legend><div class="mulistoptions"><input class="search" type="search" data-mulistevent="listen: keypress, search"><div class="mumode">Mode</div><div class="mulang">Lang</div></div><hr/><div class="mulistheader"><div class="mumode">Mode</div><div class="mutitle">Title</div><div class="mulang">Lang</div><div class="muleadername">Session leader</div><div class="muparts">Participants</div></div><div id="noresult" class="invisible">no session found</div><ul id="mulistall" data-muall="foreach"><li data-mulistevent="listen: touchstart, zoom"><div class="mumode" data-muall="bind:setMode, value.mode"></div><div class="mutitle" data-muall="bind:innerHTML, value.title">Title</div><div class="mulang" data-muall="bind:setLang, value.lang"></div><div class="muleadername" data-muall="bind:innerHTML, value.initiator.username">Leader</div><div class="muparts" data-muall="bind: setParticipants, value.participants"></div></li></ul><ul id="musort" class="invisible"></ul><ul id="musearch" class="invisible" data-musearch="foreach"><li data-mulistevent="listen: touchstart, zoom"><div class="mumode" data-musearch="bind:setMode, fields.mode"></div><div class="mutitle" data-musearch="bind:innerHTML, fields.title">Title</div><div class="mulang" data-musearch="bind:setLang, fields.lang"></div><div class="muleadername" data-musearch="bind:innerHTML, fields.initiator">Leader</div><div class="muparts" data-musearch="bind: setParticipants, fields.participants"></div></li></ul></div></div>';
                
                widget.reset = function reset(){
                       currentList = "mulistall"; 
                       // synchronize muCDB with database
                        widget.buildList(currentList).then(function(){
                                spinner.stop();
                        });
                };
                
                widget.buildList = function buildList(listId, text){
                        var arr = [], promise = new Promise();
                        console.log(document.getElementById("mulistspinner"));
                        if (listId === "mulistall"){
                                muListAll.reset([]);
                                widget.addSessions(arr, "roulette").then(function(){
                                        widget.addSessions(arr, "campfire").then(function(){
                                                widget.addSessions(arr, "boardroom").then(function(){
                                                        setTimeout(function(){muListAll.reset(arr);promise.fulfill();},120000);        
                                                }); 
                                        });   
                                });  
                        }
                        return promise;        
                };
                
                widget.syncSearch = function syncSearch(query){
                        var promise = new Promise();
                        muSearch.unsync();
                        muSearch.reset([]);
                        muSearch.sync("_fti/local/"+Config.get("db"), "indexedsessions", "roulette", {q: query, descending:true}).then(function(){
                                muSearch.loop(function(v,i){
                                        console.log(v);
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
                        if (event.keyCode === 13){
                                if (node.value === ""){
                                        widget.toggleList("mulistall");
                                }
                                else {
                                        widget.toggleList("musearch");
                                        widget.syncSearch(node.value);
                                }
                        }        
                };
                
                widget.zoom = function(event, node){
                        node.classList.add("pressed");        
                };
                
                widget.toggleList = function toggleList(list){
                        if (list !== currentList){
                                widget.buildList(list);
                                document.getElementById(currentList).classList.add("invisible");
                                document.getElementById(list).classList.remove("invisible");
                                currentList = list;
                        }
                };
                
                MUALL = muListAll;
                return widget;
                   
           };
});