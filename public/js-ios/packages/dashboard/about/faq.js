/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBView", "Bind.plugin", "Event.plugin", "Store"],
        function(Widget, Config, CouchDBView, Model, Event, Store){
           
           return function FAQConstructor(){
                
                var FAQ = new Widget(),
                    cdb = new CouchDBView(),
                    user = Config.get("user");
                    faqlist = new Store([]);
                    
                FAQ.plugins.addAll({
                        "faq" : new Model(faqlist),
                        "faqevent" : new Event(FAQ)
                });
                
                FAQ.template = '<div class="aboutcontent"><ul data-faq="foreach"><li><legend data-faq="bind:innerHTML, question"></legend><p data-faq="bind: innerHTML, response"></p></li></ul></div>';
                cdb.setTransport(Config.get('transport'));
                // fetch faqs from database
                FAQ.fetch = function fetch(lang){
                        cdb.unsync();
                        cdb.reset([]);
                        faqlist.reset([]);
                
                        cdb.sync(Config.get("db"), "about", "_view/faq").then(function(){
                                cdb.loop(function(v,i){
                                        if (v.value.default_lang === lang || !v.value.translations[lang]) {faqlist.alter("push", v.value);}
                                        else {faqlist.alter("push", v.value.translations[lang]);}
                                });      
                        });
                };
                
                // init
                FAQ.fetch(user.get("lang"));
                
                // watch for language change
                user.watchValue("lang", function(){
                        FAQ.fetch(user.get("lang"));                
                });
                
                return FAQ;         
           };   
        });
