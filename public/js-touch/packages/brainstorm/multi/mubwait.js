/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "service/map", "Olives/Model-plugin", "Olives/Event-plugin", "service/config", "service/help"],
        function(Widget, Map, Model, Event, Config, Help){
                
                return function MultiBWaitConstructor($session, $prev, $next, $progress){
                
                        var widget = new Widget();
                        
                        widget.template = '<div id="mubwait"></div>';
                        
                        widget.place(document.getElementById("mubwait"));
                        
                        widget.reset = function reset(sid){
                                console.log("mubwait : "+sid);
                        };
                        
                        return widget;
                
                };
        
})