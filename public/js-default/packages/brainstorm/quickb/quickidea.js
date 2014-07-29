/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "service/cardpopup", "../whiteboard/whiteboard", "Store", "CouchDBDocument", "Promise", "service/utils", "lib/spin.min"],
        function(Widget, Map, Model, Event, Config, CardPopup, Whiteboard, Store, CouchDBDocument, Promise, Utils, Spinner){
                
                return function QuickIdeaConstructor($session, $data, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _popupUI, _currentPopup,
                             _next="step",
                            _start,
                            _elapsed = 0,
                            _qiTimer,
                            _timer = new Store({"timer":null, "display":false}),
                            _idea = new Store({"title" : "", "description" : "", "solution" : "", "visibility": "private"}),
                            _scenario = new Store(),
                            _techs = new Store([]),
                            _techDetails = [], //used to store tech card details
                            _initTools = {
                                    "cardpopup":{"scenario":false, "techs":[false, false, false]},
                                    "postit": "inactive",
                                    "import": "inactive",
                                    "drawing": "inactive",
                                    "ready": false, // display finish button
                                    "showidea": false, // display write up interface
                                    "shownext" : false, // display next button
                                    "readonly" : false // set story textareas in readonly mode
                            },
                            _tools = new Store(_initTools),
                            _wbContent = new Store([]),
                            _wb = new Whiteboard("idea", _wbContent, _tools),
                            _transport = Config.get("transport"),
                            _labels = Config.get("labels"),
                            _user = Config.get("user"),
                            spinner = new Spinner({color:"#657B99", lines:10, length: 8, width: 4, radius:8, top: 665, left: 690}).spin();
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels, {
                                        setPlaceholder : function(value){
                                                this.setAttribute("placeholder", value);
                                        }
                                }),
                                "scenario" : new Model(_scenario),
                                "techs" : new Model(_techs, {
                                        setPic : function(pic){
                                                var node = this;
                                                if (pic){
                                                        if (pic.search("img/decks") >-1){
                                                                this.setAttribute("style", "background-image:url('"+pic+"');");
                                                        }
                                                        else{
                                                                json = {"dir":"cards", "filename":pic};
                                                                Config.get("transport").request("GetFile", json, function(data){
                                                                        node.setAttribute("style", "background:white; background-image: url('"+data+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;");   
                                                                });
                                                        }
                                                }
                                                else {
                                                        this.setAttribute("style", "background-image: none;");
                                                }
                                        }
                                        }),
                                "wbtools" : new Model(_tools, {
                                        setActive : function(status){
                                                (status === "active") ? this.classList.add("pushed") : this.classList.remove("pushed");
                                        },
                                        setReady : function(ready){
                                                (ready) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        },
                                        toggleToolbox : function(showstory){
                                                (showstory) ? this.classList.add("invisible") : this.classList.remove("invisible");
                                        },
                                        setReadonly : function(readonly){
                                                (readonly)?this.setAttribute("readonly", "readonly"):this.removeAttribute("readonly");
                                        },
                                        popup : function(pop){
                                                var idx;
                                                if (this.getAttribute("name") === "scenario"){
                                                        (pop) ? this.classList.add("highlighted") : this.classList.remove("highlighted");
                                                }
                                                else {
                                                        idx = this.getAttribute("data-techs_id");
                                                        (pop[idx]) ? this.classList.add("highlighted") : this.classList.remove("highlighted");
                                                }
                                        }
                                }),
                                "quickideatimer" : new Model(_timer, {
                                      setTime: function(timer){
                                                      if (timer) {this.innerHTML = Utils.formatDuration(timer);}       
                                      },
                                      displayTimer: function(display){
                                              (display) ? this.classList.add("showtimer") : this.classList.remove("showtimer");
                                      }
                                }),
                                "idea" : new Model(_idea, {
                                        setVisibility : function(visibility){
                                                if (visibility === "public"){
                                                        this.value = 0;
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/publicforslider.png'); background-position: 50px center; background-repeat:no-repeat; background-size: 30px;");
                                                }
                                                else{
                                                        this.value = 1;
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/privateforslider.png'); background-position: 15px center; background-repeat:no-repeat; background-size: 20px;");        
                                                }
                                        }
                                }),
                                "wbstack" : _wb,
                                "quickideaevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickidea"><div class="previousbutton" data-quickideaevent="listen: mousedown, press; listen: mousedown, prev"></div><div class="brainstorm-header header blue-dark" data-labels="bind: innerHTML, quickidea" data-quickideaevent="listen:mousedown, toggleProgress"></div><div class="timer" data-quickideatimer="bind:setTime, timer; bind: displayTimer, display" data-quickideaevent="listen:mousedown,toggleTimer"></div><div id="quickidea-left" class="leftarea"><div class="card defaultscenario" name="scenario" data-quickideaevent="listen: mousedown, select; listen:mouseup, zoom" data-wbtools="bind: popup,cardpopup.scenario"><div class="cardpicture"></div><div class="cardtitle" data-scenario="bind:innerHTML, title"></div></div><ul class="cardlist" data-techs="foreach"><li><div class="card tech" data-quickideaevent="listen: mousedown, select; listen:mouseup, zoom" data-wbtools="bind: popup,cardpopup.techs"><div class="cardpicture" data-techs="bind:setPic, pic"></div><div class="cardtitle" data-techs="bind:innerHTML,title"></div></div></li></ul></div><div id="quickidea-popup"></div><div id="quickidea-right" class="workarea"><div id="idea-whiteboard" class="whiteboard"><div class="stack" data-wbstack="destination"></div></div><div id="toolbox" data-wbtools="bind:toggleToolbox, showidea"><div class="toolbox-button"><div class="postit-button" name="postit" data-wbtools="bind:setActive, postit" data-quickideaevent="listen: mousedown, push; listen:mouseup, post"></div><legend data-labels="bind:innerHTML, post">Post-it</legend></div><div class="toolbox-button"><div class="importpic-button" name="import" data-wbtools="bind:setActive, import" data-quickideaevent="listen: mousedown, push; listen:mouseup, importpic"></div><legend data-labels="bind:innerHTML, import">Import pictures</legend></div><div class="toolbox-button"><div class="drawingtool-button" name="drawing" data-wbtools="bind:setActive, drawing" data-quickideaevent="listen: mousedown, push; listen:mouseup, draw"></div><legend data-labels="bind:innerHTML, draw">Drawing tool</legend></div></div><div class="finish-button invisible" data-wbtools="bind:setReady, ready" data-labels="bind:innerHTML, finishbutton" data-quickideaevent="listen: mousedown, press; listen:mouseup, finish"></div><div id = "quickidea-writeup" class="writeup invisible" data-wbtools="bind: setReady,showidea"><textarea class = "enterTitle" maxlength="30" data-labels="bind:setPlaceholder, ideatitleplaceholder" data-idea="bind:value, title" data-wbtools="bind:setReadonly, readonly"></textarea><input class="visibility-slider" type="range" min="0" max="1" value ="1" data-idea="bind: setVisibility, visibility" data-quickideaevent="listen:mouseup, toggleVisibility" data-wbtools="bind:setReadonly, readonly"><textarea class = "enterDesc" data-labels="bind:setPlaceholder, ideadescplaceholder" data-idea="bind:value, description" data-wbtools="bind:setReadonly, readonly"></textarea><textarea class = "enterSol" data-labels="bind:setPlaceholder, ideasolplaceholder" data-idea="bind:value, solution" data-wbtools="bind:setReadonly, readonly"></textarea></div><div class="next-button invisible" data-wbtools="bind:setReady, shownext" data-labels="bind:innerHTML, nextbutton" data-quickideaevent="listen: mousedown, press; listen:mouseup, next"></div></div></div>';
                        
                        _widget.place(Map.get("quickidea"));
                        
                        // function called when pressing a button (next or finish)
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        // move to next screen
                        _widget.next = function(event, node){
                                var now = new Date(), _timers, duration;
                                
                                spinner.spin(node.parentNode);
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                                
                                // if first time: upload scenario and set readonly
                                if (_next === "step"){
                                        _next = "screen";
                                        
                                        // stop timer and update display
                                        clearInterval(_qiTimer);
                                        _timer.set("display", true);
                                        
                                        // compute overall session time
                                        duration = _widget.getSessionDuration();
                                        
                                        // add idea to session data
                                        $data.set("idea", JSON.parse(_idea.toJSON()));
                                        
                                        // create separate idea document in couchdb
                                        _widget.createIdeaDoc()
                                        .then(function(){
                                                // update session score
                                                return _widget.updateSessionScore(_timer.get("timer"));
                                        })
                                        .then(function(){
                                                // resync with db
                                                $session.unsync();
                                                return $session.sync(Config.get("db"), $session.get("_id"));
                                        })
                                        .then(function(){
                                                var timers = $session.get("elapsedTimers");
                                                timers.quickidea = _timer.get("timer");
                                                // update session document
                                                $session.set("idea", [JSON.parse(_idea.toJSON())]);
                                                $session.set("elapsedTimers", timers);
                                                $session.set("duration", duration);
                                                $session.set("status", "completed");
                                                // set idea to readonly
                                                _tools.set("readonly", true);
                                                // move to next step
                                                return $next("quickidea");
                                        })
                                        .then(function(){
                                                // remove session in progress
                                                _user.set("sessionInProgress", {});
                                                user.upload();
                                        });
                                }
                                else {$next("quickidea");}
                        };
                        
                        _widget.stopSpinner = function stopSpinner(){
                                spinner.stop();
                                _widget.dom.querySelector(".next-button").classList.remove("invisible");   
                        };
                        
                        // move to previous screen
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickidea");
                        };
                        
                        // toggle progress bar
                        _widget.toggleProgress = function(event, node){
                                $progress();               
                        };
                        
                        // toggle timer
                        _widget.toggleTimer = function(event,node){
                                _timer.set("display", !_timer.get("display"));        
                        };
                        
                        // toggle visibility (public/private) buttons
                        _widget.toggleVisibility = function(event, node){
                                if (_next === "step"){
                                        (_idea.get("visibility") === "public") ? _idea.set("visibility", "private") : _idea.set("visibility", "public");        
                                }
                        };
                        
                        // function called when selecting one of the scenario tools
                        _widget.push = function(event, node){
                                var name = node.getAttribute("name");
                                _tools.set(name,"active");
                        };
                        
                        _widget.select = function(event, node){
                                node.classList.add("higlighted");        
                        };
                        
                        // zoom on selected card
                        _widget.zoom = function(event, node){
                                var type, id;
                                if (node.getAttribute("name") === "scenario") type="scenario";
                                else{
                                        type = "techno";
                                        id = node.getAttribute("data-techs_id");
                                        
                                }
                                _widget.setPopup(type, id);        
                        };
                        
                        // Method called to initialize a card popup
                        _widget.setPopup = function setPopup(type, id){
                                var pos = {x:147, y: 30}, // the position of the popup
                                    caret = "left", // the position of the caret
                                    popup = _tools.get("cardpopup"),
                                    story = new Store(),
                                    details = "", // the contents of the cards
                                    temp,
                                    cdb; // if content needs to be retrieved from database
                                
                                // reset previous popup if any
                                if (_currentPopup) {
                                        (_currentPopup.type === "scenario") ? popup.scenario = false : popup.techs[_currentPopup.id] = false;
                                        _tools.set("cardpopup", popup);
                                }
                                //display new popup
                                (type === "scenario") ? popup.scenario = true : popup.techs[id] = true;
                                _tools.set("cardpopup", popup);
                                
                                _currentPopup = {"type":type, "id":id};
                                
                                if (type === "scenario") {
                                        pos.y = 55;
                                        story.reset($data.get("scenario"));
                                        story.set("type", 5);
                                        details = story.toJSON();
                                        _popupUI.reset(details, pos, caret, document.getElementById("quickidea-popup"));
                                }
                                else {
                                        if (id == 0) pos.y = 200;
                                        if (id == 1) pos.y = 260;
                                        if (id == 2) pos.y = 350;
                                        if (_techDetails[id]){
                                                details = _techDetails[id];
                                                _popupUI.reset(details, pos, caret, document.getElementById("quickidea-popup"));
                                        }
                                        else{
                                               cdb = new CouchDBDocument();
                                                cdb.setTransport(_transport);
                                                cdb.sync(Config.get("db"), $data.get("techno").get(id).id).then(function(){
                                                        details = cdb.toJSON();
                                                        _popupUI.reset(details, pos, caret, document.getElementById("quickidea-popup"));
                                                        // save contents in the appropriate local store for further use
                                                        _techDetails[id] = details;
                                                 });
                                        }  
                                }        
                        };
                        
                        // Method called when closing a popup -- passed as a parameter to the popup constructor
                        _widget.closePopup = function closePopup(){
                                var cardPopup = _tools.get("cardpopup");
                                cardPopup[_currentPopup] = false;
                                _tools.set("cardpopup", cardPopup);
                                _currentPopup = "";    
                        };
                        
                        // Creating the popup UI
                        _popupUI = new CardPopup(_widget.closePopup);
                        
                        // create/edit postit
                        _widget.post = function(event, node){
                                _wb.selectScreen("postit");
                                _tools.set("import", "inactive");
                                _tools.set("drawing", "inactive");        
                        };
                        
                        // import picture
                        _widget.importpic = function(event, node){
                                _wb.selectScreen("import");
                                _tools.set("postit", "inactive");
                                _tools.set("drawing", "inactive");
                        };
                        
                        // create drawing
                        _widget.draw = function(event, node){
                                _wb.selectScreen("drawing");
                                _tools.set("import", "inactive");
                                _tools.set("postit", "inactive");
                        };
                        
                        // called when user exits one of the content creation UI
                        _widget.exitTool = function exitTool(name){
                                _tools.set(name, "inactive");
                        };
                        
                        // user is done with whiteboard
                        _widget.finish = function(event, node){
                                // change mode to readonly
                                _wb.setReadonly(true);
                                // hide finish button, toolbox and show writeup interface
                                _tools.set("ready", false);
                                _tools.set("showidea", true);
                                node.classList.remove("pressed");   
                        };
                        
                        // update session score
                        _widget.updateSessionScore = function(timer){
                                var promise = new Promise(),
                                    json = {
                                        "sid": $session.get("_id"),
                                        "step": "quickidea",
                                        "time": timer,
                                        "wbcontent": _wbContent.toJSON(),
                                        "idea": _idea.toJSON()
                                };
                                _transport.request("UpdateSessionScore", json, function(result){
                                        if (result.res === "ok"){
                                                promise.fulfill();
                                        }
                                        else {
                                                promise.reject();
                                        }
                                });
                                return promise;        
                        };
                        
                        // compute session duration
                        _widget.getSessionDuration = function getSessionDuration(){
                                var elapsed = $session.get("elapsedTime"),
                                    start = $session.get("resumeTime") || $session.get("startTime");
                                    now = new Date();
                                return (now.getTime()-start+elapsed);
                        };
                        
                        // create separate idea doc in couchDB
                        _widget.createIdeaDoc = function createIdeaDoc(){
                                var cdb = new CouchDBDocument(Config.get("ideaTemplate")),
                                    now = new Date(),
                                    _id = "I:"+now.getTime(),
                                    promise = new Promise();
                                cdb.setTransport(_transport);
                                cdb.set("title", _idea.get("title"));
                                cdb.set("sessionId", $session.get("_id"));
                                cdb.set("authors", [$session.get("initiator").id]);
                                cdb.set("description", _idea.get("description"));
                                cdb.set("solution", _idea.get("solution"));
                                cdb.set("creation_date", [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]);
                                cdb.set("character", $session.get("characters")[0]);
                                cdb.set("problem", $session.get("problems")[0]);
                                cdb.set('context', $session.get("contexts")[0]);
                                cdb.set("techno", $session.get("techno")[0]);
                                cdb.set("visibility", _idea.get("visibility"));
                                cdb.set("authornames", $session.get("initiator").username);
                                //set the idea's language to the same language as the session
                                cdb.set("lang", $session.get("lang").substring(0,2));
                                cdb.set("_id", _id);
                                //upload idea in the database
                                cdb.sync(Config.get("db"), _id)
                                .then(function(){
                                        return cdb.upload();
                                })
                                .then(function(){
                                        // updateUIP is visibility is public
                                        if (cdb.get("visibility") === "public"){
                                                _transport.request("UpdateUIP", {"userid": _user.get("_id"), "type": cdb.get("type"), "docId": cdb.get("_id"), "docTitle": cdb.get("title")}, function(result){
                                                        if (result !== "ok") {console.log(result);}
                                                });
                                        }
                                        promise.fulfill();
                                        cdb.unsync();
                                });
                                return promise;      
                        };
                        
                        // INIT QUICKIDEA STEP
                        _widget.reset = function reset(sip){
                                // reset all tools and status indicators
                                _tools.reset({
                                    "cardpopup":{"scenario":false, "techs":[false, false, false]},
                                    "postit": "inactive",
                                    "import": "inactive",
                                    "drawing": "inactive",
                                    "ready": false, // display finish button
                                    "showidea": false, // display write up interface
                                    "shownext" : false, // display next button
                                    "readonly" : false // set story textareas in readonly mode
                                });
                                
                                // reset technology
                                _techs.reset();
                                
                                // reset whiteboard (if sip, need to show existing content)
                                _wb.setSessionId($session.get("_id"));
                                _wbContent.reset($session.get("ideaWB"));
                                _wb.init();
                                (_wbContent.getNbItems()) ? _wb.selectScreen("main") : _wb.selectScreen("default");
                                
                                // reset timer if previous session was exited while in quickidea step
                                clearInterval(_qiTimer);
                                
                                // if idea is present show write up interface and board in readonly mode
                                if ($session.get("idea").length){
                                        _wb.setReadonly(true);
                                        _tools.set("ready", false);
                                        _tools.set("showidea", true);
                                        // in quick mode only one scenario is available
                                        _idea.reset($session.get("idea")[0]);
                                        // add it to the session data store
                                        $data.set("idea", $session.get("idea")[0]);
                                        // idea should be readonly
                                        _tools.set("readonly", true);
                                        _tools.set("shownext", true);
                                        // set _next to screen
                                        _next="screen";       
                                }
                                else{
                                        // idea fields are not uploaded separately        
                                        _idea.reset({"title" : "", "description" : "", "solution" : "", "visibility":"private"});
                                        (_wbContent.getNbItems()) ? _tools.set("ready", true) : _tools.set("ready", false);
                                        // remove readonly
                                        _wb.setReadonly(false);
                                        // set next to step
                                        _next="step";     
                                }
                                
                                // retrieve time already spent on this step and init/display timer as appropriate
                                if ($session.get("elapsedTimers").quickidea){
                                        _elapsed = $session.get("elapsedTimers").quickidea;
                                        _timer.set("timer", _elapsed);
                                }
                                (_next === "screen")?_timer.set("display", true):_widget.initTimer(_elapsed);
                         };
                         
                         _widget.initTimer = function(init){
                                var now = new Date(),
                                    _start = now.getTime(),
                                    elapsed = init || 0;
                                
                                _timer.set("display", false);
                                _timer.set("timer", elapsed);
                                // make sure current step is ongoing before restarting timer
                                if ($session.get("step") === "quickidea"){
                                        clearInterval(_qiTimer);
                                        _qiTimer = setInterval(function(){
                                                var now = new Date();
                                                _timer.set("timer", elapsed + now.getTime()-_start);
                                        }, 1000);
                                }          
                         };
                        
                        // get session id and pass it to Whiteboard
                        $session.watchValue("_id", function(sid){
                                _wb.setSessionId(sid);        
                        });
                        
                        // get scenario card from session data
                       $data.watchValue("scenario", function(store){
                                _scenario.reset($data.get("scenario"));   
                       });
                        
                        // get technology cards from session data
                       $data.watchValue("techno", function(store){
                               _techs.reset(JSON.parse($data.get("techno").toJSON()));       
                       });
                        
                        // upload whiteboard content to database as soon as it is updated
                        ["added", "deleted", "updated"].forEach(function(change){
                                _wbContent.watch(change, function(){
                                        if (JSON.stringify($session.get("ideaWB")) !== _wbContent.toJSON()){
                                                $session.set("ideaWB", JSON.parse(_wbContent.toJSON()));
                                                $session.upload();
                                        }
                                        
                                        // toggle ready button
                                        (_wbContent.getNbItems()) ? _tools.set("ready", true) : _tools.set("ready", false);     
                                });  
                        });
                        
                        // watch contents of scenario and display next button if ready
                        _idea.watch("updated", function(){
                                        (_idea.get("title") && _idea.get("description") && _idea.get("solution")) ? _tools.set("shownext", true) : _tools.set("shownext", false);
                        });
                        
                        // Return
                        return _widget;
                };    
        });
