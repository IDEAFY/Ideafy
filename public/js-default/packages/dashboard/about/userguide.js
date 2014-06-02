/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "CouchDBView", "Bind.plugin", "Event.plugin", "Store"],
        function(Widget, Config, CouchDBView, Model, Event, Store){
           
           return function UserGuideConstructor(){
                
                var userGuide = new Widget(),
                    cdb = new CouchDBView(),
                    user = Config.get("user"),
                    labels = Config.get("labels"),
                    howTolist = new Store([]);
                    
                userGuide.plugins.addAll({
                        "label" : new Model(labels),
                        "howto" : new Model(howTolist),
                        "howtoevent" : new Event(userGuide)
                });
                
                userGuide.template = '<div class="aboutcontent"><div id="userguidetoc"><legend data-label="bind:innerHTML, toc"></legend><ul data-howto="foreach"><li><span data-howto="bind: innerHTML, title" data-howtoevent="listen: mousedown, press; listen:mouseup, goto"></span></li></ul></div><br/><ul data-howto="foreach"><li data-howto="bind:id, _id"><legend data-howto="bind:innerHTML, title"></legend><p data-howto="bind: innerHTML, body"></p><span class="backtotop" data-label="bind:innerHTML, backtotop" data-howtoevent="listen: mousedown, backToTop"></span></li></ul></div>';
                
                userGuide.press = function(event, node){
                        node.setAttribute("style", "font-weight: bold;");        
                };
                
                userGuide.goto = function(event, node){
                        var idx = node.getAttribute("data-howto_id"),
                            id = howTolist.get(idx)._id;
                        
                        node.setAttribute("style", "font-weight: normal;");
                        
                        document.getElementById(id).scrollIntoView();
                };
                
                userGuide.backToTop = function(event, node){
                        document.getElementById("userguidetoc").scrollIntoView();        
                };
                
                cdb.setTransport(Config.get('transport'));
                
                // fetch howtos from database
                userGuide.fetch = function fetch(lang){
                        cdb.unsync();
                        cdb.reset([]);
                        howTolist.reset([]);
                        cdb.sync(Config.get("db"), "about", "_view/howto").then(function(){
                                cdb.loop(function(v,i){
                                        if (v.value.default_lang === lang || !v.value.translations[lang]) {howTolist.alter("push", v.value);}
                                        else {howTolist.alter("push", v.value.translations[lang]);}
                                });      
                        });
                };
                
                // init
                userGuide.fetch(user.get("lang"));
                
                // watch for language change
                user.watchValue("lang", function(){
                        userGuide.fetch(user.get("lang"));                
                });
                
                return userGuide;         
           };   
        });

