/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "Bind.plugin", "Store"],
        function(Widget, Config, Model, Store){
                return function TutorialsConstructor(){
                        var tutorials = new Widget(),
                            labels = Config.get("labels"),
                            tuto = [{"name": "brainstormtutorial", "src": Config.get("location")+"/tuto04.m4v"}],
                            store = new Store(tuto);
                            
                            
                        tutorials.plugins.addAll({
                                "labels" : new Model(labels),
                                "tuto" : new Model(store,{
                                        setName : function(name){
                                                this.innerHTML = labels.get(name);
                                        }        
                                })
                        });
                        
                        tutorials.template = '<div class="aboutcontent"><ul data-tuto="foreach"><li><legend data-tuto="bind: setName, name"></legend><div class="videocontent"><video width = "640" height="480" controls="controls"><source data-tuto="bind:src,src" type="video/mp4" /></video></div></li></ul></div>';
                        
                        
                        return tutorials;   
                };
        });
