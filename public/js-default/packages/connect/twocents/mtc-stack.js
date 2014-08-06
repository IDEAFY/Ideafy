/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      emily = require("../../../libs/emily"),
      amy = require("../../../libs/amy2"),
      Widget = olives.OObject,
      Config = require("../../../services/config"),
      Store = emily.Store,
      Model = olives["Bind.plugin"],
      Map = require("../../../services/map"),
      Stack = amy.StackPlugin,
      MTCDetail = require("./mtc-details"),
      MTQDetail = require("./mtq-details");

module.exports = function MTCDetailStackConstructor(){
                
                        var widget = new Widget,
                            defaultPage = new Widget(),
                            labels = Config.get("labels"),
                            mtcDetailStack = new Stack();
                            
                        widget.template = '<div id = "mtcdetailstack" data-mtcdetailstack = "destination"></div>';
                        
                        widget.plugins.addAll({
                                "mtcdetailstack" : mtcDetailStack
                        });
                        
                        widget.setView = function setView(view){
                                var current = mtcDetailStack.getStack().getCurrentName();
                                if (view === "2Q" && current !== "twoqdetail") mtcDetailStack.getStack().show("twoqdetail");
                                else if (view === "2C" && current !== "twocdetail") {
                                        mtcDetailStack.getStack().get("twocdetail").reset();
                                        mtcDetailStack.getStack().show("twocdetail");
                                }
                                else mtcDetailStack.getStack().show("defaultPage");
                        };
                        
                        widget.reset = function reset(type, data){
                                if (type === "2Q" && data) {
                                        mtcDetailStack.getStack().get("twoqdetail").reset(data);
                                        mtcDetailStack.getStack().show("twoqdetail");
                                        
                                }
                                if (type === "default" || !data){
                                        mtcDetailStack.getStack().show("defaultPage");        
                                }
                        };
                        
                        defaultPage.template = '<div class="msgsplash"><div class="header blue-dark" data-labels="bind: innerHTML, twocentview"><span></span></div><div class="innersplash" data-labels="bind: innerHTML, twocentcenter"></div></div>';
                        
                        defaultPage.plugins.add("labels", new Model(labels));
                        
                        // init
                        widget.init = function init(type, value){
                                var twoqDetail = new MTQDetail(), twocDetail = new MTCDetail();
                                mtcDetailStack.getStack().add("twoqdetail", twoqDetail);
                                mtcDetailStack.getStack().add("twocdetail", twocDetail);
                                mtcDetailStack.getStack().add("defaultPage", defaultPage);
                                
                                if (type === "default"){
                                        mtcDetailStack.getStack().show("defaultPage");        
                                }
                                if (type === "2Q"){
                                        mtcDetailStack.getStack().show("twoqdetail");
                                        twoQDetail.reset(value);
                                }
                        };
                        
                        return widget;
};