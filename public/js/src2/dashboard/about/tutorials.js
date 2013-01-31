/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Dashboard/Tutorials", ["Olives/OObject", "Config", "Olives/Model-plugin"],
        function(Widget, Config, Model){
                return function TutorialsConstructor(){
                        var tutorials = new Widget(),
                            labels = Config.get("labels"),
                            tuto = [{"name": "brainstormtutorial", "src": "http://37.153.96.26:1664:tuto04.m4v"}];
                            
                            
                        tutorials.plugins.addAll({
                                "labels" : new Model(labels),
                                "tuto" : new Model(tuto)
                        });
                        
                        tutorials.template = '<div class="aboutcontent"><ul data-tuto="foreach"><li><legend data-tuto="bind: setLabel, name"></legend><div class="videocontent"><video width = "640" height="480" controls="controls"><source data-tuto="bind:src,src" type="video/mp4" /></video></div><li><ul></div>';
                        
                        return tutorials;   
                };
        });
