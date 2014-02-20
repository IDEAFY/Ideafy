/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Store", "CouchDBDocument", "Bind.plugin", "Event.plugin", "twocents/writetwocent", "twocents/twocentlist", "Place.plugin", "service/utils"],
        function(Widget, Config, Store, CouchDBDocument, Model, Event, WriteTwocent, TwocentList, Place, Utils){
                
                function AttachmentConstructor($type){
                       
                        // declaration
                        var ui = this,
                             _attachmentTwocentListUI = new TwocentList("attach"),
                             _twocentWriteUI = new WriteTwocent("attach"),
                            cdb = new CouchDBDocument(),
                            labels = Config.get("labels"),
                            transport = Config.get("transport"),
                            user = Config.get("user"),
                            vote = new Store([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]);
                        
                        cdb.setTransport(transport);
                        // define plugins and methods
                        ui.plugins.addAll({
                                "labels" : new Model(Config.get("labels")),
                                "attach" : new Model(cdb,{
                                        setCat : function(cat){
                                                var cats = Config.get("cat"), colors = Config.get("catColors"), idx = cats.indexOf(cat);
                                                if (idx > -1) {
                                                        this.innerHTML = labels.get(cat);
                                                        this.setAttribute("style", "color:" + colors[idx]);
                                                }
                                                else{
                                                        this.innerHTML = cat;
                                                        this.setAttribute("sytle", "color: #404040");
                                                }
                                        },
                                        displayTwocentList : function(twocents){
                                                (twocents && twocents.length) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        },
                                        setDate : function(id){
                                                var stamp = parseInt(id.replace("A:", ""), 10),
                                                      date = new Date(stamp);
                                                console.log("stamp", date);
                                                this.innerHTML = date.toLocaleDateString();
                                        }
                                }),
                                "vote" : new Model(vote,{
                                        setIcon : function(active){
                                                var styleActive = "background-image: url('img/public/activeIdeaVote.png');",
                                                    styleInactive = "background-image: url('img/public/rateForList.png');";
                                                (active) ? this.setAttribute("style", styleActive) : this.setAttribute("style", styleInactive);
                                        }
                                }),
                                "place": new Place({"LibraryTwocentUI" : _attachmentTwocentListUI}),
                                "attachevent" : new Event(ui)        
                        });
                        
                        ui.template = '<div class = "attachment-screen invisible"><div class="close-popup" data-attachevent = "listen:mousedown, close"></div><div class="attach-header" data-attach="bind:innerHTML, name"></div><div class="attach-body"><div class="a-type" data-attach="bind:setType, type"></div><div class="a=left"><div class="a-name" data-attach="bind:innerHTML, name"></div><div class="a-cat" data-attach="bind:setCat, category"></div><div class="a-contrib"><span class="a-span">Contributed by: </span><span class="a-author" data-attach="bind: innerHTML, authornames"></span></div><div class="a-date" data-attach="bind:setDate, _id"></div></div><div class="a-cat" data-attach="setCat, cat"></div><div class="a-rating"></div><div class="a-vote"><ul class="acorns" data-vote="foreach"><li class="item-acorn" data-vote="bind: setIcon, active" data-ideadetailevent="listen: mousedown, previewVote; listen: mouseup, castVote"></li></ul></div></div><div id="attach-writetwocents"></div><div div id="attach-twocents" class="twocents" data-attach="bind:displayTwocentList, twocents" data-place="place:LibraryTwocentUI"></div></div>';
                        
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
