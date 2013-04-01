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
                    musessions = new Store([]),
                    labels=Config.get("labels");
                
                muCDB.setTransport(Config.get("transport"));
                
                widget.plugins.addAll({
                        "labels" : new Model(labels),
                        "muall" : new Model(muCDB)
                });
                
                widget.template = '<div id="mulist"><div id="mulist-content"><legend data-labels="bind:innerHTML, selectsession"></legend><hr/><div class="mulistheader"></div><ul id="mulistall" data-muall="foreach"><li><div data-muall="bind:innerHTML, mode">Type</div><div data-muall="bind:innerHTML, title">Title</div><div data-muall="bind:innerHTML, lang">Lang</div><div data-muall="bind:innerHTML, initiator.username">Leader</div></li></ul><ul id="mucamp invisible"></ul><ul id="musearch invisible"></ul></div></div>';
                
                widget.place(document.getElementById("mulist"));
                
                widget.reset = function reset(){
                        
                        // synchronize muCDB with database
                        muCDB.sync(Config.get("db"), "library", "_view/waitingsessions");
                        
                        
                };
                
                return widget;
                   
           };
});