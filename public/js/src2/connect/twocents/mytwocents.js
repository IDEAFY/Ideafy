/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Connect/MyTwocents", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", "Olives/UI-plugin", "Amy/Delegate-plugin", "Amy/Stack-plugin", "Amy/Control-plugin", "Ideafy/Connect/MTCDetails"],
        function(Widget, Map, Config, Model, UIPlugin, Delegate, Stack, Control, MTCDetails){
                
                return function MyTwocentsConstructor(){
                        
                        var myTwocentUI = new Widget(),
                            mtcStack = new Stack(),
                            mtcControl = new Control(myTwocentUI),
                            mtcDetails = new MTCDetails(),
                            labels = Config.get("labels");
                            
                        myTwocentUI.plugins.addAll({
                                "labels" : new Model(labels),
                                "mtcliststack" : mtcStack,
                                "mtcdetails" : new UIPlugin({"mtcDetails" : mtcDetails}),
                                "mtcControl" : mtcControl,
                                "mtcevent" : new Delegate(myTwocentUI)
                        });    
                        
                        myTwocentUI.template = '<div id="connect-twocents"><div id="mtc-list" class="list"><div class="header blue-light"><span data-labels="bind: innerHTML, mtcheadertitle">My Two Cents  Wall</span><div class="option right" data-mtcevent="listen: touchstart, plus"></div></div><div class="overflow" data-mtcliststack="destination" data-ideascontrol="radio:li,selected,touchstart,selectStart"><div class="tools"><input class="search" type="text" data-labels="bind: placeholder, searchprivateplaceholder" data-mtcevent="listen: keypress, search"><div name="#myTwoQ" class="tools-button mtq pushed" data-mtcevent="listen:touchstart,show"></div><div name="#myTwoC" class="tools-button mtc" data-mtcevent="listen:touchstart,show"></div></div></div></div><div id="mtc-detail" data-mtcdetails="place:mtcDetails" class="details"></div></div>';
                        
                        myTwocentUI.place(Map.get("connect-twocents"));
                        
                        // add twocent and twoquestion lists to the stack
                        
                        // display twoQ list (default and init details with first item)
                        
                        
                        return myTwocentUI;
                };
        });
