/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBDocument", "Bind.plugin", "Event.plugin", "twocents/writetwocent", "twocents/twocentlist", "Place.plugin"],
        function(Widget, Config, CouchDBDocument, Model, Event, WriteTwocent, TwocentList, Place){
                
                function AttachmentConstructor($type){
                       
                        // declaration
                        var ui = this,
                             _libraryTwocentList = new TwocentList("library"),
                             _twocentWriteUI = new WriteTwocent("library"),
                            cdb = new CouchDBDocument(),
                            labels = Config.get("labels"),
                            transport = Config.get("transport"),
                            user = Config.get("user");
                        
                        cdb.setTransport(transport);
                        // define plugins and methods
                        ui.plugins.addAll({
                                "labels" : new Model(Config.get("labels")),
                                "attach" : new Model(cdb),
                                "place": new Place({"LibraryTwocentUI" : _libraryTwocentList}),
                                "attachevent" : new Event(ui)        
                        });
                        
                        ui.template = '<div class = "attachment-screen"></div>';
                        
                        ui.reset = function reset(id){
                                cdb.unsync();
                                cdb.reset({});
                                cdb.sync(Config.get("db"), id)
                                .then(function(){
                                }, function(err){console.log(err);});
                                return promise;
                        };
                }
                
                return function TwocentListFactory($type){
                        AttachmentConstructor.prototype = new Widget();
                        return new AttachmentConstructor($type);
                };
        });
