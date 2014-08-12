/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "Amy/Stack-plugin", "service/config", "Store", "./aboutideafy", "./faq", "./userguide", "./tutorials", "./support", "./eula", "service/utils"],
        function(Widget, Map, Model, Event, Stack, Config, Store, AboutIdeafy, FAQ, UserGuide, Tutorials, Support, EULA, Utils){
                
           return function AboutConstructor(){
                   
                   var aboutUI = new Widget(),
                       aboutStack = new Stack(),
                       labels = Config.get("labels"),
                       menu = [
                               {name: "#about", label: labels.get("aboutIdeafy"), currentUI: false},
                               {name: "#faq", label: labels.get("faq"), currentUI: false},
                               {name: "#userguide", label: labels.get("userguide"), currentUI: false},
                               {name: "#tutorials", label: labels.get("tutorials"), currentUI: false},
                               {name: "#support", label: labels.get("support"), currentUI: false},
                               {name: "#eula", label: labels.get("eula"), currentUI: false}
                               ],
                       aboutMenu = new Store(menu);
                   
                   aboutUI.seam.addAll({
                           "label" : new Model(labels),
                           "aboutmenu" : new Model(aboutMenu, {
                                   setCurrent : function(currentStep){
                                           (currentStep) ? this.classList.add("pressed") : this.classList.remove("pressed");
                                   }
                           }),
                           "aboutstack" : aboutStack,
                           "aboutevent" : new Event(aboutUI)
                   });
                   
                   aboutUI.template = '<div id="dashboard-about"><div class="header blue-dark"><span data-label="bind:innerHTML, aboutlbl"></span></div><div class = "progressbar"><ul id = "aboutmenu" class="steplist" data-aboutmenu="foreach"><li class="step" data-aboutmenu="bind: innerHTML, label; bind:setCurrent, currentUI" data-aboutevent="listen: touchstart, changeDisplay"></li></ul></div><div id="aboutstack" data-aboutstack="destination"></div></div>';
                   
                   aboutUI.place(Map.get("dashboard-about"));
                   
                   aboutUI.changeDisplay = function changeDisplay(event, node){
                        var id = node.getAttribute("data-aboutmenu_id");
                        
                        aboutUI.show(aboutMenu.get(id).name);       
                   };
                   
                   aboutUI.show = function show(name){
                        var id, anchors;
                        aboutMenu.loop(function(v,i){
                                aboutMenu.update(i, "currentUI", false);
                                if (v.name === name) id = i;       
                        });
                        aboutMenu.update(id, "currentUI", true);
                        aboutStack.getStack().show(name);
                        
                        if (name === "#support"){
                                aboutStack.getStack().get(name).refresh();
                                // add event listener to bypass in app browser when opening links
                                anchors = aboutStack.getStack().get(name).dom.getElementsByTagName("a");
                                anchors.forEach(function(anchor){
                                        anchor.addEventListener("touchstart", Utils.showLinkInBrowser);        
                                });
                        }    
                   };
                   
                   //init stack
                   aboutStack.getStack().add("#about", new AboutIdeafy());
                   aboutStack.getStack().add("#faq", new FAQ());
                   aboutStack.getStack().add("#userguide", new UserGuide());
                   aboutStack.getStack().add("#tutorials", new Tutorials());
                   aboutStack.getStack().add("#support", new Support());
                   aboutStack.getStack().add("#eula", new EULA());
                   
                   aboutStack.getStack().show("#about");
                   aboutMenu.update(0, "currentUI", true);
                   
                   return aboutUI;
           };    
        });