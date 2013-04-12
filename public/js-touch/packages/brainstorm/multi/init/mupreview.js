/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBStore", "Bind.plugin", "Event.plugin", "service/avatar", "service/utils"],
        function(Widget, Config, CouchDBStore, Model, Event, Avatar, Utils){
                
                return function MUPreviewConstructor(){
                        
                        var muPreviewUI = new Widget(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            muCDB =  new CouchDBStore();
                        
                        muPreviewUI.plugins.addAll({
                                "labels" : new Model(labels),
                                "model" : new Model(muCDB),
                                "previewevent" : new Event(muPreviewUI)      
                        });
                        
                        muPreviewUI.template = '<div id="mupreview" class="invisible"><div class="cache"></div><div class="contentarea">Description de la session ici</div></div>';
                       
                        muPreviewUI.reset = function reset(sid){
                                console.log(sid);
                                document.getElementById("mupreview").classList.remove("invisible");  
                        };
                        
                        MUPUI = muPreviewUI;
                                              
                        return muPreviewUI;       
                };
        });