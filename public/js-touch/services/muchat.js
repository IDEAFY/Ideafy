/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "CouchDBStore"],
        function(Widget, Map, Model, Event, Config, Store){
                
                return function MuChatConstructor(){
                        
                        var widget = new Widget(),
                            muchat = new CouchDBStore();
                        
                        muchat.setTransport(Config.get("transport"));
                        
                        widget.template = '<div id="muchat"></div>';
                        
                        widget.reset = function reset($dom, $id){
                                widget.place($dom);
                                muchat.sync(Config.get("db"), $id);
                        };
                        
                        return widget;        
                        
                };
        })