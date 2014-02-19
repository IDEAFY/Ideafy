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
                             _attachmentTwocentListUI = new TwocentList("attach"),
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
                                                (twocents && twocents.length) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        }
                                }),
                                "place": new Place({"LibraryTwocentUI" : _attachmentTwocentListUI}),
                                "attachevent" : new Event(ui)        
                        });
                        
                        ui.template = '<div class = "attachment-screen invisible"><div class="close-popup" data-attachevent = "listen:mousedown, close"></div><div class="attach-header" data-attach="bind:innerHTML, name"></div><div id="attach-writetwocents"></div><div div id="attach-twocents" class="twocents" data-attach="bind:displayTwocentList, twocents" data-place="place:LibraryTwocentUI"></div></div>';
                        
                        ui.reset = function reset(id){
                                console.log(ui.dom, id);
                                // complete UI build (twocents) and display
                                var _domWrite = ui.dom.querySelector("#attach-writetwocents");
                                
                                _twocentWriteUI.reset(id);
                                _attachmentTwocentListUI.reset(id);
                                
                                ui.dom.classList.remove("invisible");
                                _twocentWriteUI.place(_domWrite);
                                
                                // retrieve attachment document form database
                                cdb.unsync();
                                cdb.reset({});
                                cdb.sync(Config.get("db"), id)
                                .then(function(){
                                        console.log(cdb.toJSON());
                                }, function(err){console.log(err);});
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
