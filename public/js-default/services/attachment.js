/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBDocument", "Bind.plugin", "Event.plugin", "twocents/writetwocent", "twocents/twocentlist", "Place.plugin", "service/utils"],
        function(Widget, Config, CouchDBDocument, Model, Event, WriteTwocent, TwocentList, Place, Utils){
                
                function AttachmentConstructor($type){
                       
                        // declaration
                        var ui = this,
                             _libraryTwocentList = new TwocentList("attach"),
                             _twocentWriteUI = new WriteTwocent("attach"),
                            cdb = new CouchDBDocument(),
                            labels = Config.get("labels"),
                            transport = Config.get("transport"),
                            user = Config.get("user");
                        
                        cdb.setTransport(transport);
                        // define plugins and methods
                        ui.plugins.addAll({
                                "labels" : new Model(Config.get("labels")),
                                "attach" : new Model(cdb,{
                                        displayTwocentList : function(twocents){
                                                (twocents && twocents.list) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        }
                                }),
                                "place": new Place({"LibraryTwocentUI" : _libraryTwocentList}),
                                "attachevent" : new Event(ui)        
                        });
                        
                        ui.template = '<div class = "attachment-screen invisible"><div class="close-popup" data-attachevent = "listen:mousedown, close"></div><div class="attach-header"></div><div id="attach-writetwocents"></div><div data-attach="bind:displayTwocentList, twocents" data-place="place:LibraryTwocentUI"></div></div>';
                        
                        ui.reset = function reset(id){
                                console.log(ui.dom, id);
                                // complete UI build and display
                                var _domWrite = ui.dom.querySelector("#attach-writetwocents");
                                ui.dom.classList.remove("invisible");
                                _twocentWriteUI.place(_domWrite);
                                
                                cdb.unsync();
                                cdb.reset({});
                                cdb.sync(Config.get("db"), id)
                                .then(function(){
                                        console.log(cdb.toJSON());
                                }, function(err){console.log(err);});
                                return promise;
                        };
                        
                        ui.close = function(event, node){
                               ui.dom.classList.add("invisible");
                               document.querySelector(".cache").classList.remove("appear");
                        };
                }
                
                return function TwocentListFactory($type){
                        AttachmentConstructor.prototype = new Widget();
                        return new AttachmentConstructor($type);
                };
        });
