/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/map", "Amy/Stack-plugin", "Bind.plugin", "Event.plugin", "./mustart", "./musetup", "./muscenario", "./mutech", "./muidea", "./muwrapup", "CouchDBDocument", "service/config", "Promise", "Store", "lib/spin.min", "Place.plugin", "service/confirm", "service/utils"],
        function(Widget, Map, Stack, Model, Event, MUStart, MUSetup, MUScenario, MUTech, MUIdea, MUWrapup, CouchDBDocument, Config, Promise, Store, Spinner, Place, Confirm, Utils){
                
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
                    _db = Config.get("db"),
                    _session = new CouchDBDocument(),
                    _sessionData = new Store(),
                    info = new Store({"msg":""}),
                    exitListener = {"listener": null},
                    confirmCallBack,
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
                _progress.template = '<div class = "progressbar invisible"><ul id = "musteplist" class="steplist" data-step="foreach"><li class="step inactive" data-step="bind: innerHTML, label; bind:setCurrent, currentStep; bind:setActive, status" data-progressevent="listen: mousedown, changeStep"></li></ul><div class="exit-brainstorm" data-progressevent="listen: mousedown, press; listen:mouseup, exit"></div></div>';
                   
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
                        node.classList.remove("pressed");
                        // handle session replay cases
                        if (_user.get("sessionInProgress").id !== _session.get("_id")){
                                $exit();
                        }
                        else{
                                if (_session.get("step") === "muwrapup"){
                                        if (_session.get("initiator").id === _user.get("_id")){
                                                muWrapup.getChatUI().setMessage("end")
                                                .then(function(){
                                                        // reset sessionInProgress in user doc
                                                        _user.set("sessionInProgress", "");
                                                        return _user.upload();      
                                                })
                                                .then(function(){
                                                        $exit();
                                                        document.removeEventListener("mousedown", exitListener.listener, true); 
                                                });
                                        }
                                        else{
                                                muWrapup.getChatUI().leave();
                                                // reset sessionInProgress in user doc
                                                _user.set("sessionInProgress", "");
                                                _user.upload().then(function(){
                                                        $exit();
                                                        document.removeEventListener("mousedown", exitListener.listener, true);       
                                                }); 
                                        }       
                                }
                                else {
                                        _widget.leave();
                                }
                        }
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
                _widget.toggleProgress = function toggleProgress(end){
                           (end) ? _progress.exit() : _progress.dom.classList.toggle("invisible");      
                   };
                   
                // initiator or a participant decides to leave the session
                
                // manage exit event : init confirm callback
                confirmCallBack = function confirmCallback(decision){
                        if (!decision){
                                Confirm.hide();
                        }
                        else{
                                if (_session.get("step") !== "muwrapup"){
                                        _user.set("sessionInProgress", "");
                                        _user.upload();
                                        if (_session.get("initiator").id === user.get("_id")){
                                                _widget.cancelSession();
                                        }
                                        else {
                                                _widget.leaveSession();
                                        }
                                }
                                else{
                                        Confirm.hide();
                                        _widget.exitSession();
                                }
                        }
                };
                
                // leader or participant decides to leave at the end of a session
                _widget.exitSession = function exitSession(){
                        if (_session.get("initiator").id === _user.get("_id")){
                                muWrapup.getChatUI().setMessage("end")
                                .then(function(){
                                        // reset sessionInProgress in user doc
                                        _user.set("sessionInProgress", "");
                                        return _user.upload();      
                                })
                                .then(function(){
                                        _widget.goToScreen();
                                });
                        }
                        else{
                                muWrapup.getChatUI().leave();
                                // reset sessionInProgress in user doc
                                _user.set("sessionInProgress", "");
                                _user.upload().then(function(){
                                        _widget.goToScreen();        
                                }); 
                        } 
                };
                
                // switch screen to destination if user confirms exit
                _widget.goToScreen = function goToScreen(){
                        var id;
                        $exit();
                        document.removeEventListener("mousedown", exitListener.listener, true); 
                                
                        // if dest is specified (e.g. notify popup)
                        if (exitDest.getAttribute && exitDest.getAttribute("data-notify_id")){
                                Config.get("observer").notify("goto-screen", "#connect");  
                                id = exitDest.getAttribute("data-notify_id");
                                observer.notify("display-message", parseInt(id, 10));     
                        }
                        // handle clicks on nav bar
                        else {
                                ["#public", "#library", "#brainstorm", "#connect", "#dashboard"].forEach(function(name){
                                        if (exitDest === name){
                                                Config.get("observer").notify("goto-screen", name);
                                        }
                                });
                        }
                };
                
                // participant decides to leave session in progress
                _widget.leaveSession = function leaveSession(){
                        var p = _session.get("participants"), i, currentUI = _stack.getStack().get(_session.get("step"));
                        
                        for (i=p.length-1; i>=0; i--){
                                if (p[i].id === _user.get("_id")){
                                        p.splice(i, 1);
                                        break; 
                                }
                        }
                        _session.set("participants", p);
                        _session.upload().then(function(){
                                // notify current chat interface
                                currentUI.getChatUI().leave();
                                _session.unsync();
                                Confirm.hide();
                        }); 
                       // reset sessionInProgress in user doc
                        _user.set("sessionInProgress", "");
                        _user.upload().then(function(){
                                $exit();
                                document.removeEventListener("mousedown", exitListener.listener, true);       
                        });          
                   };
                        
                // initiator decides to cancel the session
                _widget.cancelSession = function cancelSession(){
                        var countdown = 5000; // better to pick a high number and cancel earlier if all actions are finished
                        _widget.displayInfo("deleting", countdown).then(function(){
                                $exit();
                                document.removeEventListener("mousedown", exitListener.listener, true);
                        });      
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
                                
                        Confirm.hide();
                        infoUI.classList.remove("invisible");
                        timer = setInterval(function(){
                                switch(message){
                                        case "deleting":
                                                info.set("msg", _labels.get("deletingsession") + timeout/1000 + "s");
                                                break;
                                        case "participantsleft":
                                                info.set("msg", _labels.get("participantsleft") + " " + timeout/1000 + "s");
                                                break;
                                        default:
                                                if (message !== info.get("msg")){
                                                        info.set("msg", message);
                                                }
                                                break;      
                                }
                                if (timeout <= 0) {clearInfo();}
                                timeout -= 1000;
                        }, 1000);
                        
                        if (message === "deleting" || message === "participantsleft"){
                                //set session status to "deleted" to notify participants
                                _session.set("status", "deleted");
                                _session.upload()
                                .then(function(){
                                        // reset sessionInProgress in user doc
                                        _user.set("sessionInProgress", "");
                                        return _user.upload();
                                })
                                .then(function(){
                                        // remove chat documents
                                        var chat = _session.get("chat"), nb = chat.length, p = new Promise();
                                        if (nb){
                                                chat.forEach(function(id){
                                                        var cdb = new CouchDBDocument();
                                                        cdb.setTransport(Config.get("transport"));
                                                        cdb.sync(_db, id)
                                                        .then(function(){
                                                                return cdb.remove();
                                                        })
                                                        .then(function(){
                                                                nb --;
                                                                if (nb <= 0) {p.fulfill;}
                                                        });
                                                });
                                        }
                                        else {p.fulfill();}
                                        return p;
                                })
                                .then(function(){
                                        // and finally
                                        _session.remove();     
                                }); 
                        }
                        return promise;
                };
                
                // create Chat document
                _widget.createChat = function createChat(step){
                        var cdb = new CouchDBDocument(),
                            now = new Date().getTime(),
                            usr = [], arg, id,
                            promise = new Promise();
                        
                        // build users array
                        usr.push({"username": _session.get("initiator").username, "userid": _session.get("initiator").id});
                        _session.get("participants").forEach(function(part){
                                usr.push({"username": part.username, "userid": part.id});        
                        });
                        cdb.set("users", usr);
                        
                        // build intro message -- arg refer to quicksteps to be able to re-use existing labels
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
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(_db, id)
                        .then(function(){
                                return cdb.upload();
                        })
                        .then(function(){
                                        // update chat field in session document
                                        var chat = _session.get("chat").concat();
                                        cdb.unsync();
                                        chat.push(id);
                                        _session.set("chat", chat);
                                        promise.fulfill();
                        });
                        
                        return promise;
                };
                
                // retrieve session and start brainstorming   
                _widget.retrieveSession = function retrieveSession(sid, replay){
                        var promise = new Promise();
                        spinner.spin(document.getElementById("brainstorm"));
                           
                        // connect to couchdb and retrieve session
                        _session.reset({});
                        _session.sync(_db, sid).then(function(){
                                var step = _session.get("step"), current = 10000, length = _steps.getNbItems();
                                
                                // check session's current step and set as active
                                _steps.loop(function(v, i){
                                        if (i<current){
                                                // reset step UI with replay option
                                                _stack.getStack().get(v.name).reset(replay);
                                                _steps.update(i, "status", "done"); 
                                                if (v.name === step){
                                                        current = i;
                                                        _steps.update(i, "currentStep", true);
                                                        (v.name === "muwrapup") ? _steps.update(i, "status", "done") : _steps.update(i, "status", "ongoing");
                                                }      
                                        }      
                                });
                                
                                if (replay){
                                        spinner.stop();
                                        promise.fulfill();
                                        _stack.getStack().show("muwrapup");
                                }
                                else{
                                        // init confirmation UI
                                        if (_session.get("initiator").id === _user.get("_id")){
                                                Confirm.reset(_labels.get("leaderleave"), confirmCallBack);        
                                        }
                                        else {
                                                Confirm.reset(_labels.get("participantleave"), confirmCallBack);        
                                        }
                                        spinner.stop();
                                        promise.fulfill();
                                        _stack.getStack().show(step);
                                }
                           });
                           return promise;
                   };
                   
                _widget.leave = function leave(){
                        var lbl = "";
                        // init confirmation UI content depending on step
                        if (_session.get("initiator").id === _user.get("_id")){
                                (_session.get("step") === "muwrapup") ? lbl = labels.get("leaderexit") : lbl = labels.get("leaderleave");
                        }
                        else{
                                (_session.get("step") === "muwrapup") ? lbl = labels.get("participantexit") : lbl = labels.get("participantleave");      
                        }
                        Confirm.reset(lbl, confirmCallBack, "musession-confirm");                        
                        Confirm.show();      
                };
                   
                _widget.reset = function reset(sid, replay){
                           
                        // unsync session
                        _session.unsync();
                        
                        // reset local session data
                        _sessionData.reset();
                        
                        // reset progress bar
                        _steps.reset([
                                {name: "mustart", label: _labels.get("quickstepstart"), currentStep: false, status:"done"},
                                {name: "musetup", label: _labels.get("quickstepsetup"), currentStep: false, status:null},
                                {name: "muscenario", label: _labels.get("quickstepscenario"), currentStep: false, status:null},
                                {name: "mutech", label: _labels.get("quicksteptech"), currentStep: false, status:null},
                                {name: "muidea", label: _labels.get("quickstepidea"), currentStep: false, status:null},
                                {name: "muwrapup", label: _labels.get("quickstepwrapup"), currentStep: false, status:null}
                        ]);
                        
                                        
                        // retrieve session document and launch   
                        if (sid){
                                _widget.retrieveSession(sid, replay)
                                .then(function(){
                                        // if not in replay mode activate the exit listener
                                        if (!replay) exitListener.listener = Utils.exitListener("musession", _widget.leave);
                                });     
                        } 
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
                            _currentui = _stack.getStack().get(currentName),
                            _nextui,
                            _newStep = "", // name of the next step
                            promise = new Promise();
                            
                        _steps.loop(function(value, idx){
                                if (value.name === currentName){
                                        _id = idx;
                                }
                        });
                        
                        if (_id < _steps.getNbItems()) {
                                _newStep = _steps.get(_id+1).name;
                                _nextui = _stack.getStack().get(_newStep);
                                
                                // update progress bar
                                _steps.update(_id, "currentStep", false);
                                _steps.update(_id+1, "currentStep", true);
                                
                                // if previous step was already done do not modify status (means next=screen used for navigation only)
                                if (_steps.get(_id).status !== "done"){
                                        _steps.update(_id, "status", "done");
                                        _steps.update(_id+1, "status", "ongoing");
                                        
                                        if (_steps.get(_id+1).name === "muwrapup"){
                                                _steps.update(_id+1, "status", "done");        
                                        }
                                        
                                        // initialize new step
                                        _nextui.reset();
                                        
                                        // set new step
                                        _widget.createChat(_id+1)
                                        .then(function(){
                                                _session.set("step", _newStep);
                                                return _session.upload();
                                        })
                                        .then(function(){
                                                if (_nextui.initTimer) {
                                                        _nextui.initTimer();
                                                }
                                                _currentui.stopSpinner();
                                                _stack.getStack().show(_newStep);
                                                if (_newStep === "muwrapup"){
                                                        _user.unsync();
                                                        _user.sync(Config.get("db"), _user.get("_id"))
                                                        .then(function(){
                                                                _user.set("sessionInProgress", "");;
                                                                return _user.upload();       
                                                        })
                                                        .then(function(){
                                                                promise.fulfill();
                                                        });
                                                }
                                                else{
                                                        promise.fulfill();
                                                }        
                                        });
                                }
                                else {
                                        _currentui.stopSpinner();
                                        _stack.getStack().show(_newStep);
                                        promise.fulfill();
                                }
                        }
                        return promise;       
                   };
                   
                _widget.init = function init(){
                           
                           // initialize step UIs
                           muStart = new MUStart(_session, _widget.prev, _widget.next, _widget.toggleProgress);
                           muSetup = new MUSetup(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress);
                           muScenario = new MUScenario(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress);
                           muTech = new MUTech(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress);
                           muIdea = new MUIdea(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress);
                           muWrapup = new MUWrapup(_session, _sessionData, _widget.prev, _widget.next, _widget.toggleProgress);
                           // setup -- initialize UIs (progress bar and stack) and _session couchdbdocument
                           
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
                        // if session is deleted (in case initiator decides to cancel)
                        if (value === "deleted" && _session.get("initiator").id !== _user.get("_id")){
                             // reset sessionInProgress in user doc
                                _user.set("sessionInProgress", "");
                                _user.upload();
                                _widget.displayInfo(_labels.get("canceledbyleader"), 2000).then(function(){
                                        _session.unsync();
                                        $exit();
                                        document.removeEventListener("mousedown", exitListener.listener, true); 
                                });
                        }    
                });
                
                // trigger move to the next step for session participants
                _session.watchValue("step", function(value){
                        var idx, newStep = _session.get("step");
                        if (_session.get("initiator") && _session.get("initiator").id !== _user.get("_id")){
                                _steps.loop(function(v, i){
                                        if (v.name === newStep){idx = i;}
                                });
                                
                                // update progress bar and status
                                _steps.update(idx-1, "status", "done");
                                _steps.update(idx, "status", "ongoing");
                                _steps.update(idx-1, "currentStep", false);
                                _steps.update(idx, "currentStep", true);
                                
                                // init and show new step UI
                                _stack.getStack().get(value).reset();
                                _stack.getStack().show(value);
                        }
                        
                        if (step === "muwrapup"){
                                _user.unsync();
                                _user.sync(Config.get("db"), _user.get("_id"))
                                .then(function(){
                                        _user.set("sessionInProgress", "");;
                                        return _user.upload();       
                                });
                        }      
                });
                
                // end session if there are no more participants
                _session.watchValue("participants", function(part){
                        if (part.length === 0 && _session.get("step") !== "muwrapup"){
                                _widget.displayInfo("participantsleft", 10000)
                                .then(function(){
                                        _user.set("sessionInProgress", "");;
                                        return _user.upload();       
                                })
                                .then(function(){
                                        $exit();
                                        document.removeEventListener("mousedown", exitListener.listener, true);
                                });
                        }                
                });
                
                // return
                return _widget;
           };    
        });
 
/*
 * ALSO SHOULD REGULARLY CHECK IF LEADER IS STILL CONNECTED....
 */ 
