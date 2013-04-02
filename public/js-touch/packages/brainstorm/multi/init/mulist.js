/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "CouchDBStore", "service/config", "Promise", "Store"],
        function(Widget, Model, Event, CouchDBStore, Config, Promise, Store){
                
           return function MuListConstructor($exit){
           
                var widget = new Widget(),
                    muCDB = new CouchDBStore(),
                    muSearch = new CouchDBStore(),
                    musessions = new Store([]),
                    muListOptions = new Store(),
                    currentList = "mulistall",
                    labels=Config.get("labels");
                
                muSearch.setTransport(Config.get("transport"));
                muCDB.setTransport(Config.get("transport"));
                
                widget.plugins.addAll({
                        "labels" : new Model(labels),
                        "muall" : new Model(muCDB, {
                                setParticipants : function (array){
                                        this.innerHTML = array.length + 1;
                                }
                        }),
                        "musearch" : new Model(muSearch, {
                                setParticipants : function (nb){
                                        this.innerHTML = parseInt(nb,10) + 1;
                                }        
                        }),
                        "mulistevent" : new Event(widget)
                });
                
                widget.template = '<div id="mulist"><div id="mulist-content"><legend data-labels="bind:innerHTML, selectsession"></legend><div class="mulistoptions"><input class="search" type="search" data-mulistevent="listen: keypress, search"><div class="mumode">Mode</div><div class="mulang">Lang</div></div><hr/><div class="mulistheader"></div><ul id="mulistall" data-muall="foreach"><li><div data-muall="bind:innerHTML, value.mode">Type</div><div data-muall="bind:innerHTML, value.title">Title</div><div data-muall="bind:innerHTML, value.lang">Lang</div><div data-muall="bind:innerHTML, value.initiator.username">Leader</div><div data-muall="bind: setParticipants, value.participants"></div></li></ul><ul id="musort" class="invisible"></ul><ul id="musearch" class="invisible" data-musearch="foreach"><li><div data-musearch="bind:innerHTML, fields.mode">Type</div><div data-musearch="bind:innerHTML, fields.title">Title</div><div data-musearch="bind:innerHTML, fields.lang">Lang</div><div data-musearch="bind:innerHTML, fields.initiator">Leader</div><div data-musearch="bind: setParticipants, fields.participants"></div></li></ul></div></div>';
                
                widget.place(document.getElementById("mulist"));
                
                widget.reset = function reset(){
                       currentList = "mulistall"; 
                        // synchronize muCDB with database
                        widget.syncAll();
                };
                
                widget.syncAll = function syncAll(){
                        var promise = new Promise();
                        muCDB.unsync();
                        muCDB.reset([]);
                        muCDB.sync(Config.get("db"), "library", "_view/waitingsessions", {descending:true}).then(function(){
                                promise.fulfill();
                        });
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
                
                widget.toggleList = function toggleList(list){
                        if (list !== currentList){
                                document.getElementById(currentList).classList.add("invisible");
                                document.getElementById(list).classList.remove("invisible");
                        }
                };
                
                return widget;
                   
           };
});