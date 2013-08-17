/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Bind.plugin", "CouchDBDocument", "Store"],
        function(Widget, Config, Model, CouchDBDocument, Store){
           
                return function EULAConstructor(){
                        
                        var eula = new Widget(),
                            user = Config.get("user"),
                            model = new Store();
                            
                        eula.plugins.add("eula", new Model(model));
                        
                        eula.template = '<div class="aboutcontent"><h4 data-eula = "bind:innerHTML, title"></h4><div data-eula="bind:innerHTML, body"></div></div>';
                        
                        // fetch faqs from database
                        eula.fetch = function fetch(lang){
                                var cdb = new CouchDBDocument();
                                cdb.setTransport(Config.get("transport"));
                                cdb.sync(Config.get("db"), "EULA-PC").then(function(){
                                        if (cdb.get("default_lang") === lang || !cdb.get("translations")[lang]){
                                                model.set("title", cdb.get("title"));
                                                model.set("body", cdb.get("body"));
                                        }
                                       else {
                                               model.set("title", cdb.get("translations")[lang].title);
                                               model.set("body", cdb.get("translations")[lang].body);
                                        }      
                                });
                        };
                
                        // init
                        eula.fetch(user.get("lang"));
                
                        // watch for language change
                        user.watchValue("lang", function(){
                                eula.fetch(user.get("lang"));                
                        });
                        
                        return eula;                
                };
        });
