/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Amy/Stack-plugin", "Bind.plugin", "Event.plugin", "./mustart", "./musetup", "./muscenario", "./mutech", "./muidea", "./muwrapup", "CouchDBStore", "service/config", "Promise", "Store"],
        function(Widget, Map, Stack, Model, Event, MUStart, MUSetup, MUScenario, MUTech, MUIdea, MUWrapup, CouchDBStore, Config, Promise, Store){
                
           return function MUControllerConstructor($exit){
                   
                   // declaration
                   var _widget = new Widget(),
                       _progress = new Widget(),
                       _frag = document.createDocumentFragment(),
                       _stack = new Stack(),
                       _labels = Config.get("labels"),
                       steps = [
                               {name: "mustart", label: _labels.get("quickstepstart"), currentStep: false, status:"done"},
                               {name: "musetup", label: _labels.get("quickstepsetup"), currentStep: false, status:null},
                               {name: "muscenario", label: _labels.get("quickstepscenario"), currentStep: false, status:null},
                               {name: "mutech", label: _labels.get("quicksteptech"), currentStep: false, status:null},
                               {name: "muidea", label: _labels.get("quickstepidea"), currentStep: false, status:null},
                               {name: "muwrapup", label: _labels.get("quickstepwrapup"), currentStep: false, status:null}
                               ],
                       _steps = new Store(steps),
                       _user = Config.get("user"),
                       _session = new CouchDBStore()
                       _sessionData = new Store();
                   
                   // progress bar setup
                   _progress.plugins.addAll({
                           "labels" : new Model(_labels),
                           "step" : new Model(_steps, {
                                   setCurrent : function(currentStep){
                                           (currentStep) ? this.classList.add("pressed") : this.classList.remove("pressed");
                                   },
                                   setActive : function(status){
                                           (status) ? this.classList.remove("inactive") : this.classList.add("inactive");
                                   }
                           }),
                           "progressevent" : new Event(_progress)
                   });
                   _progress.template = '<div class = "progressbar"><ul id = "quicksteplist" class="steplist" data-step="foreach"><li class="step inactive" data-step="bind: innerHTML, label; bind:setCurrent, currentStep; bind:setActive, status" data-progressevent="listen: touchstart, changeStep"></li></ul><div class="exit-brainstorm" data-progressevent="listen: touchstart, press; listen:touchend, exit"></div></div>';
                   _progress.place(_frag);
                   
                   
                   // Main UI setup
                   _widget.template = '<div id="musession"><div class="stack" data-musessionstack="destination"></div></div>';
                   _widget.plugins.add("musessionstack", _stack);
                   
                   
                   // UI methods
                   
                   _progress.changeStep = function(event, node){
                        var _id = node.getAttribute("data-step_id");
                        // only change if new step status is not null
                        if (_steps.get(_id).status){
                                _steps.loop(function(v,i){
                                        (_id == i) ? _steps.update(i, "currentStep", true) : _steps.update(i, "currentStep", false);
                                });
                                _stack.getStack().show(_steps.get(_id).name);
                                //_widget.toggleProgress(node);
                        }
                        else {
                                event.stopImmediatePropagation();
                        }              
                   };
                   
                   _progress.press = function(event, node){
                           node.classList.add("pressed");
                   };
                   
                   _progress.exit = function(event, node){
                           node.classList.remove("pressed");
                           $exit();
                   };
                   
                   _widget.retrieveSession = function retrieveSession(sid){
                           
                           var replay = true;
                           // reset local session data
                           _sessionData.reset();
                           
                           // connect to couchdbstore and retrieve session
                           _session.unsync();
                           _session.reset();
                           _session.sync(Config.get("db"), sid).then(function(){
                                var step = _session.get("step"), current = 10000, length = _steps.getNbItems();
                                
                                // reset step UIs
                                _stack.getStack().get("mustart").reset(replay);
                                _stack.getStack().get("musetup").reset(replay);
                                _stack.getStack().get("muscenario").reset(replay);
                                _stack.getStack().get("mutech").reset(replay);
                                _stack.getStack().get("muidea").reset(replay);
                                _stack.getStack().get("muwrapup").reset(replay);
                                
                                // check session's current step and set as active
                                _steps.loop(function(v, i){
                                        if (i<current){
                                                if (v.name === step){
                                                        current = i;
                                                        _steps.update(i, "currentStep", true);
                                                        (v.name === "muwrapup") ? _steps.update(i, "status", "done") : _steps.update(i, "status", "ongoing");
                                                        
                                                } 
                                                else _steps.update(i, "status", "done");       
                                        }      
                                });
                                
                                // display wrapup screen else display start screen
                                _stack.getStack().show("muwrapup");
                           });
                   };
                   
                   _widget.startNewSession = function startNewSession(sid){
                        
                        // reset all step UIS
                        _stack.getStack().get("mustart").reset();
                        _stack.getStack().get("musetup").reset();
                        _stack.getStack().get("muscenario").reset();
                        _stack.getStack().get("mutech").reset();
                        _stack.getStack().get("muidea").reset();
                        _stack.getStack().get("muwrapup").reset();
                        
                        // display first step
                        _stack.getStack().show("musetup");
                   };
                   
                   _widget.reset = function reset(sid, replay){
                        // unsync session
                        _session.unsync(); 
                        
                        // reset local session data
                        _sessionData.reset(); 
                           
                        // reset progress bar
                        _steps.reset(steps);
                           
                        (replay) ?  _widget.retrieveSession(sid) : _widget.startNewSession(sid);  
                   };
                   
                   _widget.prev = function prev(currentName){
                        var _id;
                        _steps.loop(function(value, idx){
                                if (value.name === currentName){
                                        _id = idx;
                                }
                        });
                        if (_id>0) {
                                _steps.update(_id, "currentStep", false);
                                _steps.update(_id-1, "currentStep", true);
                                _stack.getStack().show(_steps.get(_id-1).name);
                        }
                        else {
                                alert("Exiting session");
                                $exit();
                        }            
                   };
                   
                   _widget.next = function next(currentName){
                        var _id,
                            _nextui;
                        _steps.loop(function(value, idx){
                                if (value.name === currentName){
                                        _id = idx;
                                }
                        });
                        
                        if (_id < _steps.getNbItems()-1) {
                                // if previous step was already done do not modify status
                                if (_steps.get(_id).status !== "done"){
                                        _steps.update(_id, "status", "done");
                                        _steps.update(_id, "currentStep", false);
                                        _steps.update(_id+1, "status", "ongoing");
                                        _steps.update(_id+1, "currentStep", true);
                                        
                                        _session.set("step", _steps.get(_id+1).name);
                                        _session.upload();
                                        _nextui = _stack.getStack().get(_steps.get(_id+1).name);
                                        if (_nextui.initTimer) _nextui.initTimer();
                                        _stack.getStack().show(_steps.get(_id+1).name);
                                }
                                else {
                                        _stack.getStack().show(_steps.get(_id+1).name);
                                }
                        }        
                   };
                   
                   _widget.init = function init(){
                           
                           // setup -- initialize UIs (progress bar and stack) and _session couchdbstore
                           _session.setTransport(Config.get("transport"));
                           
                           _stack.getStack().add("mustart", new MUStart(_session, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("musetup", new MUSetup(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("muscenario", new MUScenario(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("mutech", new MUTech(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("muidea", new MUIdea(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("muwrapup", new MUWrapup(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress));
                           
                           _widget.reset(sid);
                   };
                   
                   _widget.toggleProgress = function toggleProgress(node){
                           var _progressBar = node.querySelector(".progressbar");
                           
                           if (_progressBar) {
                                   setTimeout(function(){
                                           node.removeChild(_progressBar);
                                        _progress.place(_frag);
                                        }, 600);
                           }
                           else node.appendChild(_frag);        
                   };
                   
                   // init
                   _widget.init();
                   
                   // return
                   return _widget;
           };    
        });