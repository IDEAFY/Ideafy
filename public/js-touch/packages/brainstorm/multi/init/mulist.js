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
                    musessions = new Store([]),
                    labels=Config.get("labels");
                
                widget.plugins.addAll({
                        "labels" : new Model(labels),
                        "musessions" : new Model
                });
                
                widget.template = '<div id="mulist"><div id="mulist-content"><legend data-labels="bind:innerHTML, selectsession"></legend><hr/><div class="mulistheader"></div><ul id="mulistul"></ul><ul id="mucamp invisible"></ul><ul id="musearch invisible"></ul></div></div>';
                
                widget.place(document.getElementById("mulist"));
                
                widget.reset = function reset(){
                };
                
                return widget;
                   
           };
});