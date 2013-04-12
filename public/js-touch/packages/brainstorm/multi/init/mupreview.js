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
                            muCDB =  new CouchDBStore(),
                            refreshList; // callback function when closing th epreview window
                        
                        muCDB.setTransport(Config.get("transport"));
                        
                        muPreviewUI.plugins.addAll({
                                "labels" : new Model(labels),
                                "model" : new Model(muCDB),
                                "previewevent" : new Event(muPreviewUI)      
                        });
                        
                        muPreviewUI.template = '<div id="mupreview" class="invisible"><div class="cache"></div><div class="contentarea">Description de la session ici<div class="close" data-previewevent="listen:touchstart, closePreview"></div></div></div>';
                       
                        muPreviewUI.reset = function reset(sid, callback){
                                console.log(sid);
                                document.getElementById("mupreview").classList.remove("invisible");
                                refreshList = callback;  
                        };
                        
                        muPreviewUI.closePreview = function closePreview(event, node){
                                // hide window
                                document.getElementById("mupreview").classList.remove("invisible");
                                muCDB.unsync();
                                muCDB.reset();
                                refreshList();               
                        };
                        
                        MUPUI = muPreviewUI;
                                              
                        return muPreviewUI;       
                };
        });