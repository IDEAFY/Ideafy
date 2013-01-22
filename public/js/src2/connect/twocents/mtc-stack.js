/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Connect/MTCDetailStack", 
        ["Olives/OObject", "Map", "Amy/Stack-plugin", "Ideafy/Connect/MTCDetails", "Config", "Store"], 
        function(Widget, Map, Stack, MTCDetail, Config, Store){
                

                return function MTCDetailStackConstructor(){
                
                        var widget = new Widget,
                            mtcDetailStack = new Stack();
                            
                        widget.template = '<div id = "mtcdetailstack" data-mtcdetailstack = "destination"></div>';
                        
                        widget.plugins.addAll({
                                "mtcdetailstack" : mtcDetailStack
                        });
                        
                        widget.setView = function setView(view){
                                var current = mtcDetailStack.getStack().getCurrentName();
                                if (view === "2Q" && current !== "twoqdetail") mtcDetailStack.getStack().show("twoqdetail");        
                        };
                        
                        widget.reset = function reset(type, data){
                                if (type === "2Q") mtcDetailStack.getStack().get("twoqdetail").reset(type, data)
                        };
                        
                        // init
                        widget.init = function init(type, value){
                                var twoqDetail = new MTCDetail();
                                mtcDetailStack.getStack().add("twoqdetail", twoqDetail);
                                mtcDetailStack.getStack().show("twoqdetail");
                                twoQDetail.reset(type, value);
                        }
                        
                        MTCS = mtcDetailStack;
                        
                        return widget;
                };
});