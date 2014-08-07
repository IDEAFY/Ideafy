/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      emily = require("../../../libs/emily"),
      Widget = olives.OObject,
      Map = require("../../../services/map"),
      Config = require("../../../services/config"),
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Help = require("../../../services/help"),
      Store = emily.Store,
      Promise = emily.Promise,
      Spinner = require("../../../libs/spin.min");

module.exports = function QuickStartConstructor($session, $prev, $next, $progress){
                        
                        // declaration
                        var _widget = new Widget(),
                            _user = Config.get("user"),
                            _db = Config.get("db"),
                            _languages = new Store(Config.get("userLanguages")),
                            _resetLang = function(){
                                // set language to the user's language by default
                                var l = _user.get("lang").substring(0,2);
                                $session.set("lang", l);
                                _languages.loop(function(v,i){
                                        (v.name === l) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);       
                                });        
                            },
                             _labels = Config.get("labels"),
                             _next = "step",
                             spinner = new Spinner({color:"#657B99", lines:10, length: 8, width: 4, radius:8, top: 360, left:545}).spin();
                             // deduct 20px from position shown in navigator
                        
                        // reset languages
                        _resetLang();
                        
                        // setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "select" : new Model (_languages, {
                                        setBg : function(name){
                                                this.setAttribute("style", "background-image:url('img/flags/"+name+".png');");
                                                //(name === _user.get("lang").substring(0,2)) ? this.classList.add("selected") : this.classList.remove("selected");
                                        },
                                        setSelected : function(selected){
                                                (selected) ? this.classList.add("selected") : this.classList.remove("selected");        
                                        } 
                                }),
                                "model" : new Model($session, {
                                        setTitle : function(initiator){
                                                var _now = new Date();
                                                if (initiator && initiator.username) this.setAttribute("placeholder", _labels.get("quickstarttitleplaceholderpre")+initiator.username+_labels.get("quickstarttitleplaceholderpost"));
                                        },
                                        displayLang : function(lang){
                                                var l=lang.substring(0,2);
                                                this.setAttribute("style", "background-image:url('img/flags/"+l+".png');");       
                                        }
                                }),
                                "quickstartevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickstart"><div class="previousbutton" data-quickstartevent="listen: mousedown, press; listen: mousedown, prev"></div><div class="brainstorm-header header blue-dark" data-labels="bind: innerHTML, quickstart" data-quickstartevent="listen:mousedown, toggleProgress"></div><div class="help-brainstorm" data-quickstartevent="listen:mousedown, help"></div><form class="quickstart-form"><div class="idealang"><div class="currentlang" data-model="bind: displayLang, lang" data-quickstartevent="listen: mouseup, showLang"></div><ul class="invisible" data-select="foreach"><li data-select="bind: setBg, name; bind: setSelected, selected" data-quickstartevent="listen: mousedown, selectFlag; listen: mouseup, setLang"></li></ul></div><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="quickstart-title" autofocus="" name="title" data-model="bind:value, title; bind: setTitle, initiator"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="quickstart-desc" name="description" data-model="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickstartevent="listen: mousedown, press; listen:mouseup, next"></div></form><div>';
                        
                        _widget.place(Map.get("quickstart"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                
                                spinner.spin(node.parentNode);
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                               
                               if (_next === "step"){
                                        _next = "screen";
                                        // if title field is empty, set placeholder value as the default title
                                        if ($session.get("title") === ""){
                                                $session.set("title", _labels.get("quickstarttitleplaceholderpre")+$session.get("initiator").username+_labels.get("quickstarttitleplaceholderpost"));      
                                        }
                                        
                                        // set session language to the user's language
                                        $session.set("lang", _user.get("lang"));
                                
                                        // IMPORTANT: the new session doc is created in CDB and the session document is synched for the entire session
                                        $session.set("_id", "S:QUICK:"+$session.get("startTime"));
                                        $session.sync(_db, $session.get("_id"))
                                        .then(function(){
                                                // set session in progress in user document
                                                _user.set("sessionInProgress", {id : $session.get("_id"), type: "quick"});
                                                return _user.upload();
                                        })
                                        .then(function(){
                                                // next step
                                                $next("quickstart"); 
                                        });
                                        
                                }
                                else{
                                        $next("quickstart");        
                                }
                        };
                        
                        _widget.stopSpinner = function stopSpinner(){
                                spinner.stop();
                                _widget.dom.querySelector(".next-button").classList.remove("invisible");   
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickstart");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress();               
                        };
                        
                        _widget.showLang = function(event, node){
                                _widget.dom.querySelector(".idealang ul").classList.remove("invisible");        
                        };
                        
                        _widget.selectFlag = function(event, node){
                                var id;
                                event.stopPropagation();
                                id = parseInt(node.getAttribute("data-select_id"), 10);
                                _languages.loop(function(v,i){
                                        (id === i) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);
                                });                
                        };
                        
                        _widget.setLang = function(event, node){
                                var id;
                                event.stopPropagation();
                                id = node.getAttribute("data-select_id");
                                $session.set("lang", _languages.get(id).name);
                                _widget.dom.querySelector(".idealang ul").classList.add("invisible");        
                        };
                        
                        _widget.reset = function reset(sip){
                                var now = new Date(), step = $session.get("step"), promise = new Promise();
                                if (sip){
                                        (step === "quickstart") ? _next = "step" : _next = "screen";
                                        // set resume time (to be added to elapsed time) if session is still in progress
                                        if (step !== "quickwrapup") $session.set("resumeTime", now.getTime());    
                                }
                                else{
                                        $session.set("startTime", now.getTime());
                                        $session.set("date", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                        $session.set("lang", _user.get("lang"));
                                        _next = "step";
                                }
                        };
                        
                        _widget.help = function(event, node){
                                Help.setContent("quickstarthelp");
                                document.getElementById("cache").classList.add("appear");
                                document.getElementById("help-popup").classList.add("appear");
                         };
                        
                        // return
                        return _widget;
};