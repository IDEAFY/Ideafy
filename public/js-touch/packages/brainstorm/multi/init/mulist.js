/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "service/config", "Promise", "Store"],
        function(Widget, Model, Event, CouchDBStore, Config, Promise, Store){
                
           return function MuListConstructor($exit){
           
                var widget = new Widget(),
                    labels=Config.get("labels");
                
                widget.plugins.addAll({
                        "labels" : new Model(labels)
                });
                
                widget.template = '<div id="mulist"><div id="mulist-content"><legend data-labels="bind:innerHTML, selectsession">Multi-user session list</legend></div></div>';
                
                widget.place(document.getElementById("mulist"));
                
                widget.reset = function reset(){
                };
                
                return widget;
                   
           };
});