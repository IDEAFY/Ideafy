/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Dashboard/UserGuide", ["Olives/OObject", "Config", "CouchDBStore", "Olives/Model-plugin", "Olives/Event-plugin", "Store"],
        function(Widget, Config, CouchDBStore, Model, Event, Store){
           
           return function UserGuideConstructor(){
                
                var userGuide = new Widget(),
                    cdb = new CouchDBStore(),
                    lang = Config.get("user").get("lang");
                    howTolist = new Store([]);
                    
                userGuide.plugins.addAll({
                        "howto" : new Model(howTolist),
                        "howtoevent" : new Event(userGuide)
                });
                
                userGuide.template = '<div class="aboutcontent"><ul data-howto="foreach"><li><legend data-howto="bind:innerHTML, title"></legend><p data-howto="bind: innerHTML, body"></p></li></ul></div>';
                
                // fetch faqs from database
                cdb.setTransport(Config.get('transport'));
                
                cdb.sync(Config.get("db"), "about", "_view/howto").then(function(){
                        cdb.loop(function(v,i){
                                if (v.value.default_lang === lang || !v.value.translations[lang]) howTolist.alter("push", v.value)
                                else howTolist.alter("push", v.value.translations[lang]);
                        });      
                });
                
                return userGuide;         
           };   
        });
