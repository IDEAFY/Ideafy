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
                    session = new Store({}),
                    error = new Store({"errormsg":""}),
                    labels= Config.get("labels"),
                    user = Config.get("user");
                
                widget.plugins.addAll({
                        "labels": new Model(labels),
                        "newmub": new Model(session, {
                                setSessionInfo : function(mode){
                                        switch(mode){
                                                case "campfire":
                                                        this.innerHTML = labels.get("campfireinfo");
                                                        break;
                                                case "boardroom":
                                                        this.innerHTML = labels.get("boardroominfo");
                                                        break;
                                                default:
                                                        this.innerHTML = labels.get("rouletteinfo");
                                                        break;
                                        }
                                },
                                displayInvitations : function(mode){
                                        if (mode === "boardroom"){
                                                this.classList.remove("invisible");
                                        }
                                        else{
                                                this.classList.add("invisible");
                                        }
                                },
                                setTitle : function(initiator){
                                        var _now = new Date();
                                        if (initiator && initiator.username) {
                                                this.setAttribute("placeholder", labels.get("quickstarttitleplaceholderpre")+initiator.username+labels.get("quickstarttitleplaceholderpost"));
                                        }
                                        this.removeAttribute("readonly");
                                }
                        }),
                        "errormsg": new Model(error),
                        "newmubevent": new Event(widget)
                });
                
                widget.template = '<div id="newmub"><div id="newmub-content"><form><label>Select mode</label><hr/><div class="select-mode"><select data-newmubevent="listen:change, setSessionMode"><option name="roulette" data-labels="bind:innerHTML, roulette"></option><option name="campfire" data-labels="bind:innerHTML, campfire"></option><option name="boardroom" data-labels="bind:innerHTML, boardroom"></option></select><span class="session-info" data-newmub="bind: setSessionInfo, mode"></span></div><div class="invite-contacts invisible" data-newmub="bind:displayInvitations, mode"><label>Invite your contacts</label><hr/></div><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="session-title" readonly="readonly" name="title" data-newmub="bind:value, title; bind: setTitle, initiator" data-newmubevent="listen: touchstart, removeReadonly"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="session-desc" name="description" data-model="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea></form><div class="newmub-footer"><p class="send"><label class="clear" data-labels="bind:innerHTML, clear" data-newmubevent="listen: touchstart, press; listen:touchend, clear">Clear</label><label class="create" data-labels="bind:innerHTML, create" data-newmubevent="listen:touchstart, press; listen:touchend, create">Create</label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p></div></div></div>';
                
                widget.place(document.getElementById("newmub"));
                
                widget.reset = function reset(){
                        var sessionTemplate = {"title" : "",
                                "description" : "",
                                "initiator" : {
                                        "id" : user.get("_id"),
                                        "username" : user.get("username"),
                                        "picture_file" : user.get("picture_file")
                                },
                                "participants" : [],
                                "date" : [],
                                "startTime" : null,
                                "resumeTime" : null,
                                "duration" : null,
                                "elapsedTime" : 0,
                                "elapsedTimers" : {},
                                "mode" : "roulette",
                                "type" : 8,
                                "deck" : "",
                                "status" : "waiting",
                                "step" : "",
                                "lang" : user.get("lang"),
                                "characters" : [],
                                "contexts" : [],
                                "problems" : [],
                                "scenarioWB" : [],
                                "scenario" : [], //{"title" : "", "story" : "", "solution" : ""}
                                "techno" : [[]],
                                "ideaWB" : [],
                                "idea" : [], //{"title" : "", "description" : "", "solution" : "", "visibility" : "private", "id" : "" }
                                "score" : "",
                                "chat" : []};
                        session.reset(sessionTemplate);       
                };
                
                widget.setSessionMode = function(event, node){
                        var id = node.selectedIndex,
                            opt = node.childNodes[id],
                            name = opt.getAttribute("name");
                        
                        session.set("mode", name);
                };
                
                /*widget.removeReadonly = function(event, node){
                        node.removeAttribute("readonly");        
                };*/
                
                widget.press = function(event, node){
                        node.classList.add("pressed");        
                };
                
                widget.clear = function(event, node){
                        node.classList.remove("pressed");        
                };
                
                widget.create = function(event, node){
                        node.classList.remove("pressed");        
                };
                
                // init
                widget.reset();
                
                return widget;
                   
           };
});