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
      Config = require("../../../services/config"),
      Model = olives["Bind.plugin"],
      CouchDBDocument = CouchDBTools.CouchDBDocument,
      Store = emily.Store;

module.exports = function EULAConstructor(){
                        
                        var eula = new Widget(),
                            user = Config.get("user"),
                            model = new Store();
                            
                        eula.seam.add("eula", new Model(model));
                        
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
                                        cdb.unsync();
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

