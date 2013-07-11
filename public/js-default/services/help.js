/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "Store"],
        function(Widget, Map, Model, Event, Config, Store){
                
                return new function HelpConstructor(){
                
                        var _widget = new Widget(),
                            _labels = Config.get("labels"),
                            _content = new Store({"html":""});
                        
                        _widget.plugins.addAll({
                                "help" : new Model(_content),
                                "helpevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div><div class="help-doctor"></div><div class="close-help" data-helpevent="listen:mousedown, closeHelp"></div><div class="help-screen" data-help="bind:innerHTML,html"></div></div>';
                        
                        _widget.render();
                        _widget.place(Map.get("help-popup"));
                        
                        _widget.setContent = function setContent(label){
                                _content.set("html", _labels.get(label));        
                        };
                        
                        _widget.closeHelp = function(event, node){
                                // hide window
                                document.getElementById("help-popup").classList.remove("appear");
                                document.getElementById("cache").classList.remove("appear");
                        };
                        
                        return _widget;
                };
                
        });