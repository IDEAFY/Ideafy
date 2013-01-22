/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Connect/MTCDetailStack", 
        ["Olives/OObject", "Map", "Amy/Stack-plugin", "Ideafy/Connect/MTCDetails", "Ideafy/Connect/MTQDetails", "Config", "Store"], 
        function(Widget, Map, Stack, MTCDetail, MTQDetail, Config, Store){
                

                return function MTCDetailStackConstructor(){
                
                        var widget = new Widget,
                            mtcDetailStack = new Stack();
                            
                        widget.template = '<div id = "mtcdetailstack" data-mtcdetailstack = "destination"></div>';
                        
                        widget.plugins.addAll({
                                "mtcdetailstack" : mtcDetailStack
                        });
                        
                        widget.setView = function setView(view){
                                var current = mtcDetailStack.getStack().getCurrentName();
                                if (view === "2Q" && current !== "twoqdetail") mtcDetailStack.getStack().show("twoqdetail")
                                else if (view === "2C" && current !== "twocdetail") {
                                        mtcDetailStack.getStack().get("twocdetail").reset()
                                        mtcDetailStack.getStack().show("twocdetail");
                                }   
                        };
                        
                        widget.reset = function reset(type, data){
                                if (type === "2Q") mtcDetailStack.getStack().get("twoqdetail").reset(data)
                        };
                        
                        // init
                        widget.init = function init(type, value){
                                var twoqDetail = new MTQDetail(), twocDetail = new MTCDetail();
                                mtcDetailStack.getStack().add("twoqdetail", twoqDetail);
                                console.log("twoQ init ok");
                                mtcDetailStack.getStack().add("twocdetail", twocDetail);
                                console.log("twoC init ok");
                                mtcDetailStack.getStack().show("twoqdetail");
                                twoQDetail.reset(value);
                        };
                        
                        MTCS = mtcDetailStack;
                        
                        return widget;
                };
});