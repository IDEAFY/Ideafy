/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Amy/Stack-plugin", "Bind.plugin", "Event.plugin", "./mustart", "./musetup", "./muscenario", "./mutech", "./muidea", "./muwrapup", "CouchDBStore", "service/config", "Promise", "Store", "lib/spin.min", "Place.plugin", "service/confirm"],
        function(Widget, Map, Stack, Model, Event, MUStart, MUSetup, MUScenario, MUTech, MUIdea, MUWrapup, CouchDBStore, Config, Promise, Store, Spinner, Place, Confirm){
                
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
                       muStart, muSetup, muScenario, muTech, muIdea, muWrapup,
                       _steps = new Store(steps),
                       _user = Config.get("user"),
                       _session = new CouchDBStore(),
                       _sessionData = new Store(),
                       info = new Store({"msg":""}),
                       confirmUI, confirmCallBack,
                       spinner = new Spinner({color:"#9AC9CD", lines:10, length: 20, width: 8, radius:15}).spin();
                   
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
                   _progress.template = '<div class = "progressbar invisible"><ul id = "musteplist" class="steplist" data-step="foreach"><li class="step inactive" data-step="bind: innerHTML, label; bind:setCurrent, currentStep; bind:setActive, status" data-progressevent="listen: touchstart, changeStep"></li></ul><div class="exit-brainstorm" data-progressevent="listen: touchstart, press; listen:touchend, exit"></div></div>';
                   
                   // progress bar UI methods
                   
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
                           console.log("exit called");
                           node.classList.remove("pressed");
                           confirmUI.show(); 
                   };
                   
                   // Main UI setup
                   _widget.template = '<div id="musession"><div data-place="place:progress"></div><div class="sessionmsg invisible"> <span data-info="bind:innerHTML, msg"></div><div class="stack" data-musessionstack="destination"></div></div>';
                   
                   _widget.plugins.addAll({
                           "musessionstack": _stack,
                           "place": new Place({"progress": _progress}),
                           "info": new Model(info)
                   });
                   
                   
                   
                   // Main UI methods
                   
                   // show progress bar
                   _widget.toggleProgress = function toggleProgress(){
                           _progress.dom.classList.toggle("invisible");      
                   };
                   
                   // initiator or a participant decides to leave the waiting room
                   // participant decides to leave session
                   _widget.leaveSession = function leaveSession(){
                        var p = _session.get("participants"), i;
                        for (i=p.length-1; i>=0; i--){
                                if (p[i].id === _user.get("_id")){
                                        console.log("participant leaving : ", p[i].username);
                                        p.splice(i, 1);
                                        break; 
                                }
                        }
                        _session.set("participants", p);
                        _session.upload().then(function(){
                                /*
                                 * need to get chatUI for the current step (getChatUI method)
                                 */
                                // reset sessionInProgress in user doc
                                _user.set("sessionInProgress", "");
                                _user.upload();
                                // chatUI.leave().then(function(){
                                    _session.unsync();
                                    confirmUI.hide();        
                                //});
                        }); 
                       // no need to wait for upload result to leave session
                        $exit();           
                   };
                        
                // initiator decides to cancel the session
                _widget.cancelSession = function cancelSession(){
                        console.log("initiator canceling session");
                        //set session status to "deleted" to notify participants
                        _session.set("status", "deleted");
                        _session.upload().then(function(){
                                // reset sessionInProgress in user doc
                                _user.set("sessionInProgress", "");
                                _user.upload();
                                // chatUI.cancel();
                                _widget.displayInfo("deleting", 5000).then(function(){
                                        _session.remove();
                                        _session.unsync();
                                        confirmUI.hide();
                                        $exit();       
                                });
                        }, function(err){console.log(err);});        
                };
                        
                // display info popup
                _widget.displayInfo = function displayInfo(message, timeout){
                        var timer, infoUI = document.querySelector(".sessionmsg"),
                            promise = new Promise(),
                            clearInfo = function(){
                                infoUI.classList.add("invisible");
                                clearInterval(timer);
                                info.set("msg", "");
                                promise.fulfill();
                            };
                                
                        confirmUI.hide();
                        infoUI.classList.remove("invisible");
                        timer = setInterval(function(){
                                if (message !== "deleting") {info.set("msg", message);}
                                else {
                                        info.set("msg", _labels.get("deletingsession") + timeout/1000 + "s");
                                }
                                if (timeout <= 0) clearInfo();
                                timeout -= 1000;
                        }, 1000);
                        return promise;
                };
                
                // create Chat document
                _widget.createChat = function createChat(step){
                        var cdb = new CouchDBStore(),
                            now = new Date().getTime(),
                            usr = [], arg, id,
                            promise = new Promise();
                        
                        // build users array
                        usr.push([{"username": _session.get("initiator").username, "userid": _session.get("initiator").id}]);
                        _session.get("participants").forEach(function(part){
                                usr.push({"username": part.username, "userid": part.id});        
                        });
                        cdb.set("users", usr);
                        
                        // build intro message
                        switch(step){
                                case 1:
                                        arg = "quicksetup";
                                        break;
                                case 2:
                                        arg = "quickscenario";
                                        break;
                                case 3:
                                        arg = "quicktech";
                                        break;
                                case 4:
                                        arg = "quickidea";
                                        break;
                                case 5:
                                        arg = "quickwrapup";
                                        break;
                                default:
                                        arg  ="quickstart";
                                        break;
                        }
                        cdb.set("msg", [{user: "SYS", "type": 5, "arg": arg, "time": now}]);
                        
                        // complete chat template
                        cdb.set("sid", _session.get("_id"));
                        cdb.set("lang", _session.get("lang"));
                        cdb.set("readonly", false); // once the step is cleared readonly is set to true
                        cdb.set("step", step); // mubwait or mubstart will display the same chat
                        cdb.set("type", 17);
                         
                         // set id
                        id = cdb.get("sid")+"_"+step;
                        console.log(id);
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(Config.get("db"), id);
                        setTimeout(function(){
                                cdb.upload()
                                .then(function(){
                                        return cdb.unsync();
                                })
                                .then(function(){
                                        var chat = _session.get("chat");
                                        chat.push(id);
                                        _session.set("chat", chat);
                                        return _session.upload;    
                                })
                                .then(function(){
                                        console.log(cdb.toJSON(), _session.get("chat"));
                                        promise.fulfill();
                                })
                        }, 200);
                        
                        return promise;
                };
                
                // retrieve session and start brainstorming   
                _widget.retrieveSession = function retrieveSession(sid, replay){
                           
                        spinner.spin(document.getElementById("brainstorm"));
                           
                        // connect to couchdbstore and retrieve session
                        _session.reset();
                        _session.sync(Config.get("db"), sid).then(function(){
                                var step = _session.get("step"), current = 10000, length = _steps.getNbItems();
                                
                                // reset step UIs
                                muStart.reset(replay);
                                muSetup.reset(replay);
                                muScenario.reset(replay);
                                muTech.reset(replay);
                                muIdea.reset(replay);
                                muWrapup.reset(replay);
                                
                                // init exit confirmation UI
                                confirmUI = new Confirm(_widget.dom);
                                confirmCallBack = function(decision){
                                        console.log("callback called, decision : ", decision);
                                        if (!decision){
                                                confirmUI.hide();
                                        }
                                        else{
                                                if (_session.get("initiator").id === _user.get("_id")){
                                                        _widget.cancelSession();
                                                }
                                                else {
                                                        _widget.leaveSession();
                                                }
                                        }
                                };
                                // init confirmation UI
                                if (_session.get("initiator").id === _user.get("_id")){
                                        confirmUI.reset(_labels.get("leaderleave"), confirmCallBack);        
                                }
                                else {
                                        confirmUI.reset(_labels.get("participantleave"), confirmCallBack);        
                                }
                                
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
                                
                                if (replay){
                                        spinner.stop();
                                        _stack.getStack().show("muwrapup");
                                }
                                else{
                                        // check if current step already has a chat document (leader must create one if necessary)
                                        if (!_session.get("chat")[current] && _user.get("_id") === _session.get("initiator").id){
                                                _widget.createChat(current).then(function(){
                                                        spinner.stop();
                                                        _stack.getStack().show(step);        
                                                });
                                        }
                                        else {
                                                spinner.stop();
                                                _stack.getStack().show(step);
                                        }
                                }
                           });
                   };
                   
                   _widget.reset = function reset(sid, replay){
                           
                        console.log("mucontroller reset function called");
                        
                        // unsync session
                        _session.unsync(); 
                        
                        // reset local session data
                        _sessionData.reset(); 
                           
                        // reset progress bar
                        _steps.reset(steps);
                        
                        // retrieve session document and launch   
                        _widget.retrieveSession(sid, replay);  
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
                            _nextui,
                            _currentui = _stack.getStack().get(currentName);
                            promise = new Promise();
                            
                        _steps.loop(function(value, idx){
                                if (value.name === currentName){
                                        _id = idx;
                                }
                        });
                        
                        if (_id < _steps.getNbItems()-1) {
                                
                                // update progress bar
                                _steps.update(_id, "currentStep", false);
                                _steps.update(_id+1, "currentStep", true);
                                
                                // if previous step was already done do not modify status
                                if (_steps.get(_id).status !== "done"){
                                        _steps.update(_id, "status", "done");
                                        _steps.update(_id+1, "status", "ongoing");
                                        
                                        _session.set("step", _steps.get(_id+1).name);
                                        _session.upload().then(function(){
                                                _nextui = _stack.getStack().get(_steps.get(_id+1).name);
                                                if (_nextui.initTimer) _nextui.initTimer();
                                                _currentui.stopSpinner();
                                                _stack.getStack().show(_steps.get(_id+1).name);
                                                promise.fulfill();        
                                        });
                                }
                                else {
                                        _currentui.stopSpinner();
                                        _stack.getStack().show(_steps.get(_id+1).name);
                                        promise.fulfill();
                                }
                        }
                        
                        return promise;       
                   };
                   
                   _widget.init = function init(){
                           
                           console.log("mucontroller init entered");
                           // initialize step UIs
                           muStart = new MUStart(_session, _widget.prev, _widget.next, _widget.toggleProgress);
                           muSetup = new MUSetup(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress);
                           muScenario = new MUScenario(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress);
                           muTech = new MUTech(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress);
                           muIdea = new MUIdea(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress);
                           muWrapup = new MUWrapup(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress);
                           // setup -- initialize UIs (progress bar and stack) and _session couchdbstore
                           
                           _session.setTransport(Config.get("transport"));
                           
                           _stack.getStack().add("mustart", muStart);
                           _stack.getStack().add("musetup", muSetup);
                           _stack.getStack().add("muscenario", muScenario);
                           _stack.getStack().add("mutech", muTech);
                           _stack.getStack().add("muidea", muIdea);
                           _stack.getStack().add("muwrapup", muWrapup);
                           
                   };
                   
                   // init
                   _widget.init();
                   
                   // watch for session events
                   // watch for session status change
                   _session.watchValue("status", function(value){
                        console.log(value);
                        // if session is deleted (in case initiator decides to cancel)
                        if (value === "deleted" && _session.get("initiator").id !== _user.get("_id")){
                             // reset sessionInProgress in user doc
                                _user.set("sessionInProgress", "");
                                _user.upload();
                                _widget.displayInfo(_labels.get("canceledbyleader"), 2000).then(function(){
                                        _session.unsync();
                                        $exit();     
                                });
                        }    
                   });
                   
                   // return
                   return _widget;
           };    
        });