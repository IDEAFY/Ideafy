/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "service/config", "Promise", "Store"],
        function(Widget, Model, Event, CouchDBStore, Config, Promise, Store){
                
           return function NewMUBConstructor($exit){
           
                var widget = new Widget(),
                    sessionTemplate = {"title" : "",
                                "description" : "",
                                "initiator" : {
                                        "id" : "",
                                        "username" : "",
                                        "picture_file" : ""
                                },
                                "participants" : [],
                                "date" : [],
                                "startTime" : null,
                                "resumeTime" : null,
                                "duration" : null,
                                "elapsedTime" : 0,
                                "elapsedTimers" : {},
                                "mode" : "",
                                "type" : 8,
                                "deck" : "",
                                "status" : "waiting",
                                "step" : "",
                                "lang" : "en-us",
                                "characters" : [],
                                "contexts" : [],
                                "problems" : [],
                                "scenarioWB" : [],
                                "scenario" : [], //{"title" : "", "story" : "", "solution" : ""}
                                "techno" : [[]],
                                "ideaWB" : [],
                                "idea" : [], //{"title" : "", "description" : "", "solution" : "", "visibility" : "private", "id" : "" }
                                "score" : "",
                                "chat" : []},
                    session = new Store({}),
                    labels= Config.get("labels"),
                    user = Config.get("user");
                
                widget.plugins.addAll({
                        "labels": new Model(labels),
                        "model": new Model(session)
                });
                
                widget.template = '<div id="newmub"><form><legend>Session settings</legend><label>Select mode</label><hr/><select><option>Roulette</option><option>Campfire</option><option>Boardroom</option></select><span class="session-info">What does it mean?</span><label>Choose language</label><hr/><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="session-title" name="title" data-model="bind:value, title; bind: setTitle, initiator"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="session-desc" name="description" data-model="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea></form></div>';
                
                widget.place(document.getElementById("newmub"));
                
                widget.reset = function reset(){        
                };
                
                return widget;
                   
           };
});