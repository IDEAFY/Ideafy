/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "Store", "Bind.plugin", "Event.plugin", "twocents/writetwocent", "twocents/twocentlist", "service/avatar", "service/utils", "Place.plugin"],
        function(Widget, Config, Store, Model, Event, WriteTwocent, TwocentList, Avatar, Utils, Place){
                
                return function MTCDetailsConstructor(){
                        
                        var mtcDetailUI = new Widget(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            twocentList = new TwocentList("connect");
                        
                        mtcDetailUI.plugins.addAll({
                                "labels" : new Model(labels),
                                "place" : new Place({"TwocentUI": twocentList})      
                        });
                        
                        mtcDetailUI.template = '<div class="twocent-detail"><div class="header blue-dark"><span data-labels="bind: innerHTML, mytwocentwall"></span></div><div class = "detail-contents"><div id="connect-twocents" class="twocents" data-place="place: TwocentUI"></div></div></div>';
                       
                       mtcDetailUI.reset = function reset(){
                                twocentList.reset(user.get("_id"), "connect");        
                       };
                                          
                       return mtcDetailUI;       
                };
        });

