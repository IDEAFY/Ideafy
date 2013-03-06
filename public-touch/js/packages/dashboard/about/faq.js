/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "service/config", "CouchDBStore", "Olives/Model-plugin", "Olives/Event-plugin", "Store"],
        function(Widget, Config, CouchDBStore, Model, Event, Store){
           
           return function FAQConstructor(){
                
                var FAQ = new Widget(),
                    cdb = new CouchDBStore(),
                    lang = Config.get("user").get("lang");
                    faqlist = new Store([]);
                    
                FAQ.plugins.addAll({
                        "faq" : new Model(faqlist),
                        "faqevent" : new Event(FAQ)
                });
                
                FAQ.template = '<div class="aboutcontent"><ul data-faq="foreach"><li><legend data-faq="bind:innerHTML, question"></legend><p data-faq="bind: innerHTML, response"></p></li></ul></div>';
                
                // fetch faqs from database
                cdb.setTransport(Config.get('transport'));
                
                cdb.sync(Config.get("db"), "about", "_view/faq").then(function(){
                        cdb.loop(function(v,i){
                                if (v.value.default_lang === lang || !v.value.translations[lang]) faqlist.alter("push", v.value)
                                else faqlist.alter("push", v.value.translations[lang]);
                        });      
                });
                
                return FAQ;         
           };   
        });
