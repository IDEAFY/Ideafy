/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      emily = require("../../../libs/emily"),
      CouchDBTools = require("../../../libs/CouchDBTools"),
      Widget = olives.OObject,
      Config = require("../../../services.config"),
      CouchDBView = CouchDBTools.CouchDBView,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Store = emily.Store;

module.exports = function FAQConstructor(){
                
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
                                cdb.unsync();
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
