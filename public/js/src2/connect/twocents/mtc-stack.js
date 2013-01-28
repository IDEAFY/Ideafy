/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Connect/MTCDetailStack", 
        ["Olives/OObject", "Map", "Amy/Stack-plugin", "Olives/Model-plugin", "Ideafy/Connect/MTCDetails", "Ideafy/Connect/MTQDetails", "Config", "Store"], 
        function(Widget, Map, Stack, Model, MTCDetail, MTQDetail, Config, Store){
                

                return function MTCDetailStackConstructor(){
                
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
                                if (view === "2Q" && current !== "twoqdetail") mtcDetailStack.getStack().show("twoqdetail")
                                else if (view === "2C" && current !== "twocdetail") {
                                        mtcDetailStack.getStack().get("twocdetail").reset();
                                        mtcDetailStack.getStack().show("twocdetail");
                                }
                                else mtcDetailStack.getStack().show("defaultPage");
                        };
                        
                        widget.reset = function reset(type, data){
                                if (type === "2Q") {
                                        mtcDetailStack.getStack().get("twoqdetail").reset(data);
                                        if (mtcDetailStack.getStack().getCurrentName !== "twoqdetail") mtcDetailStack.getStack().show("twoqdetail");
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
});