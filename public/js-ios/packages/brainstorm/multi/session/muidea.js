/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "Place.plugin", "service/config", "service/cardpopup", "../../whiteboard/whiteboard", "Store", "CouchDBDocument", "Promise", "service/utils", "lib/spin.min", "./mubchat", "./muvote"],
        function(Widget, Map, Model, Event, Place, Config, CardPopup, Whiteboard, Store, CouchDBDocument, Promise, Utils, Spinner, Chat, Vote){
                
                return function MUIdeaConstructor($session, $data, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _popupUI, _currentPopup,
                            chatUI = new Chat(),
                            voteUI = new Vote(),
                             _next="step",
                            _start,
                            _elapsed = 0,
                            _miTimer, _miInterval,
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
                            _wb = new Whiteboard("idea", _wbContent, _tools, "mu"),
                            _transport = Config.get("transport"),
                            _user = Config.get("user"),
                            _db = Config.get("db"),
                            _labels = Config.get("labels"),
                            _voted = false, // to prevent voting popup from reappearing after voting has been done
                            spinner = new Spinner({color:"#657B99", lines:10, length: 8, width: 4, radius:8, top: 695, left: 670}).spin();
                        
                        // identify if user is the current session leader
                        _widget.isLeader = function isLeader(){
                                return ($session.get("initiator") && $session.get("initiator").id === _user.get("_id"));
                        };
                        
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
                                                if (_widget.isLeader()){
                                                        (ready) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                                }
                                                else{
                                                        this.classList.add("invisible");
                                                }
                                        },
                                        showIdea : function(showidea){
                                                (showidea) ? this.classList.remove("invisible") : this.classList.add("invisible");        
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
                                "muideatimer" : new Model(_timer, {
                                      setTime: function(timer){
                                                      this.innerHTML = Utils.formatDuration(timer);       
                                      },
                                      displayTimer: function(display){
                                              (display) ? this.classList.add("showtimer") : this.classList.remove("showtimer");
                                      }
                                }),
                                "idea" : new Model(_idea),
                                "wbstack" : _wb,
                                "place" : new Place({"chat": chatUI, "vote": voteUI}),
                                "muideaevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "muidea"><div class="previousbutton" data-muideaevent="listen: touchstart, press; listen: touchstart, prev"></div><div class="brainstorm-header header blue-dark" data-labels="bind: innerHTML, muidea" data-muideaevent="listen:touchstart, toggleProgress"></div><div class="timer" data-muideatimer="bind:setTime, timer; bind: displayTimer, display" data-muideaevent="listen:touchstart,toggleTimer"></div><div id="muidea-left"><div class="idea-cards leftarea folded" data-muideaevent="listen:touchstart, fold"><div class="card defaultscenario" name="scenario" data-muideaevent="listen: touchstart, zoom" data-wbtools="bind: popup,cardpopup.scenario"><div class="cardpicture"></div><div class="cardtitle" data-scenario="bind:innerHTML, title"></div></div><ul class="cardlist" data-techs="foreach"><li><div class="card tech" data-muideaevent="listen: touchstart, zoom" data-wbtools="bind: popup,cardpopup.techs"><div class="cardpicture" data-techs="bind:setPic, pic"></div><div class="cardtitle" data-techs="bind:innerHTML,title"></div></div></li></ul><div class="caret"></div></div><div id="muidea-popup"></div><div class ="toolbox" data-wbtools="bind:toggleToolbox, showidea"><div class="toolbox-button"><div class="postit-button" name="postit" data-wbtools="bind:setActive, postit" data-muideaevent="listen: touchstart, push; listen:touchend, post"></div><legend data-labels="bind:innerHTML, post">Post-it</legend></div><div class="toolbox-button"><div class="importpic-button" name="import" data-wbtools="bind:setActive, import" data-muideaevent="listen: touchstart, push; listen:touchend, importpic"></div><legend data-labels="bind:innerHTML, import">Import pictures</legend></div><div class="toolbox-button"><div class="drawingtool-button" name="drawing" data-wbtools="bind:setActive, drawing" data-muideaevent="listen: touchstart, push; listen:touchend, draw"></div><legend data-labels="bind:innerHTML, draw">Drawing tool</legend></div><div class="finish-button invisible" data-wbtools="bind:setReady, ready" data-labels="bind:innerHTML, finishbutton" data-muideaevent="listen: touchstart, press; listen:touchend, finish"></div></div></div><div id="muidea-right" class="workarea"><div id="idea-whiteboard" class="whiteboard"><div class="stack" data-wbstack="destination"></div><div class="caret descending invisible" data-muideaevent="listen:touchstart, toggleCaret"></div></div><div id = "muidea-writeup" class="writeup invisible" data-wbtools="bind: showIdea,showidea"><textarea class = "enterTitle" maxlength="30" data-labels="bind:setPlaceholder, ideatitleplaceholder" data-idea="bind:value, title" data-wbtools="bind:setReadonly, readonly" data-muideaevent="listen:input, updateField"></textarea><textarea class = "enterDesc" data-labels="bind:setPlaceholder, ideadescplaceholder" data-idea="bind:value, description" data-wbtools="bind:setReadonly, readonly" data-muideaevent="listen:input, updateField"></textarea><textarea class = "enterSol" data-labels="bind:setPlaceholder, ideasolplaceholder" data-idea="bind:value, solution" data-wbtools="bind:setReadonly, readonly" data-muideaevent="listen:input, updateField"></textarea></div><div class="next-button invisible" data-wbtools="bind:setReady, shownext" data-labels="bind:innerHTML, nextbutton" data-muideaevent="listen: touchstart, press; listen:touchend, next"></div></div><div class="sessionvote" data-place="place:vote"></div><div class="sessionchat" data-place="place:chat"></div></div>';
                        
                        _widget.place(Map.get("muidea"));
                        
                        // function called when pressing a button (next or finish)
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        // move to next screen
                        _widget.next = function(event, node){
                                var now = new Date(), _timers, duration, visibility, replay, promise = new Promise();
                                
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                                
                                // if first time: upload scenario and set readonly
                                if (_next === "step"){
                                        _next = "screen";
                                        
                                        // set idea to readonly
                                        _tools.set("readonly", true);
                                        
                                        // stop timer and update display
                                        clearInterval(_miTimer);
                                        _timer.set("display", true);
                                        
                                        // stop scenario autoupdates
                                        clearInterval(_miInterval);
                                        
                                        // compute overall session time
                                        duration = _widget.getSessionDuration();
                                        
                                        // display voting interface
                                        voteUI.reset($session, function(result){
                                                _voted = true;
                                                visibility = result.visibility;
                                                replay = result.replay;
                                                _idea.set("visibility", visibility);
                                                _idea.set("sessionReplay", replay);
                                                promise.fulfill();
                                                voteUI.close();             
                                        });
                                        
                                        promise.then(function(){
                                                spinner.spin(node.parentNode);
                                                // add idea to session data
                                                $data.set("idea", JSON.parse(_idea.toJSON()));
                                        
                                                // create separate idea document in couchdb
                                                return _widget.createIdeaDoc();
                                        })
                                        .then(function(){
                                                // unsync session document, resync, add new data
                                                $session.unsync();
                                                return $session.sync(_db, $session.get("_id"));
                                        })
                                        .then(function(){
                                                var timers = $session.get("elapsedTimers");
                                                // notify participants via chat
                                                chatUI.conclude("next");
                                                
                                                timers.muidea = _timer.get("timer");
                                                // update session document
                                                $session.set("idea", [JSON.parse(_idea.toJSON())]);
                                                if (replay) $session.set("replayIdeas", []);
                                                $session.set("elapsedTimers", timers);
                                                $session.set("duration", duration);
                                                $session.set("status", "completed");
                                                $session.set("idea", [$data.get("idea")]);
                                                return $session.upload();
                                        })
                                        .then(function(){
                                                // update session score
                                                return _widget.updateSessionScore(_timer.get("timer"));
                                        })
                                        .then(function(){
                                                $next("muidea");       
                                        });
                                }
                                else $next("muidea");
                        };
                        
                        // stop spinner when next is successful
                        _widget.stopSpinner = function stopSpinner(){
                                spinner.stop();
                        };
                        
                        // move to previous screen
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("muidea");
                        };
                        
                        // toggle progress bar
                        _widget.toggleProgress = function(event, node){
                                $progress();               
                        };
                        
                        // toggle timer
                        _widget.toggleTimer = function(event,node){
                                if (_widget.isLeader()){
                                        _timer.set("display", !_timer.get("display"));
                                }       
                        };
                        
                        // toggle visibility (public/private) buttons
                        _widget.toggleVisibility = function(event, node){
                                if (_next === "step" && _widget.isLeader()){
                                        (_idea.get("visibility") === "public") ? _idea.set("visibility", "private") : _idea.set("visibility", "public");        
                                }
                        };
                        
                        // function called when selecting one of the scenario tools
                        _widget.push = function(event, node){
                                var name = node.getAttribute("name");
                                _tools.set(name,"active");
                        };
                        
                        // zoom on selected card
                        _widget.zoom = function(event, node){
                                event.stopPropagation();
                                var type, id;
                                if (node.getAttribute("name") === "scenario") type="scenario";
                                else{
                                        type = "techno";
                                        id = node.getAttribute("data-techs_id");
                                        
                                }
                                _widget.setPopup(type, id);        
                        };
                        
                        // show/hide the setup cards
                        _widget.fold = function(event, node){
                                // disable toggle in scenario write up phase
                                if (!$session.get("ideaReady")){
                                        node.classList.toggle("folded");
                                        node.querySelector(".caret").classList.toggle("folding");
                                        // hide card popup if present
                                        if (_currentPopup){
                                                _popupUI.close();
                                        }
                                }
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
                                        _popupUI.reset(details, pos, caret, document.getElementById("muidea-popup"));
                                }
                                else {
                                        if (id == 0) pos.y = 200;
                                        if (id == 1) pos.y = 260;
                                        if (id == 2) pos.y = 350;
                                        if (_techDetails[id]){
                                                details = _techDetails[id];
                                                _popupUI.reset(details, pos, caret, document.getElementById("muidea-popup"));
                                        }
                                        else{
                                               cdb = new CouchDBDocument();
                                                cdb.setTransport(_transport);
                                                cdb.sync(Config.get("db"), $data.get("techno").get(id).id).then(function(){
                                                        details = cdb.toJSON();
                                                        _popupUI.reset(details, pos, caret, document.getElementById("muidea-popup"));
                                                        // save contents in the appropriate local store for further use
                                                        _techDetails[id] = details;
                                                 });
                                        }  
                                }        
                        };
                        
                        // Method called when closing a popup -- passed as a parameter to the popup constructor
                        _widget.closePopup = function closePopup(){
                                _tools.set("cardpopup", {"scenario":false, "techs":[false, false, false]});
                                _currentPopup = "";
                        };
                        
                        // Creating the popup UI
                        _popupUI = new CardPopup(_widget.closePopup);
                        
                        // Getting the chat UI
                        _widget.getChatUI = function getChatUI(){
                                return chatUI;        
                        };
                        
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
                                var finishSpinner = new Spinner({color:"#657B99", lines:10, length: 8, width: 4, radius:8, top: 550, left: 50}).spin();
                                // hide finish button
                                finishSpinner.spin(node.parentNode);
                                node.classList.add("invisible");
                                 
                                // notify other participants
                                $session.unsync();
                                $session.sync(_db, $session.get("_id"))
                                .then(function(){
                                        $session.set("ideaReady", true);
                                        return $session.upload();       
                                })
                                .then(function(){
                                        finishSpinner.stop();
                                        // reset and hide finish button
                                        node.classList.remove("pressed");
                                        _tools.set("ready", false);
                                
                                        _widget.displayIdea();
                                        // monitor scenario updates if user is the session leader
                                        _widget.updateIdea();
                                });      
                        };
                        
                        // update _scenario store every time a new input is entered
                        _widget.updateField = function updateField(event, node){
                                if (node.classList.contains("enterTitle")){
                                        _idea.set("title", node.value);
                                }
                                if (node.classList.contains("enterDesc")){
                                        _idea.set("description", node.value);
                                }
                                if (node.classList.contains("enterSol")){
                                        _idea.set("solution", node.value);
                                }       
                        };
                        
                        // function called to display the story writeup interface
                        _widget.displayIdea = function displayIdea(){
                                // change whiteboard mode to readonly
                                _wb.setReadonly(true);
                                // hide toolbox and show writeup interface
                                _tools.set("showidea", true);
                                // removed folded class from scenario cards
                                _widget.dom.querySelector(".idea-cards").classList.remove("folded");
                                _widget.dom.querySelector(".idea-cards .caret").classList.add("invisible");
                                // display writeup interface
                                _widget.dom.querySelector(".writeup").scrollIntoView();
                                // display caret at the bottom of the whiteboard
                                _widget.dom.querySelector(".whiteboard .caret").classList.remove("invisible");
                        };
                        
                        // function to reset / hide story
                        _widget.hideIdea = function hideIdea(){
                                // add folded class to scenario cards
                                _widget.dom.querySelector(".idea-cards").classList.add("folded");
                                _widget.dom.querySelector(".idea-cards .caret").classList.remove("invisible");
                                
                                // remove caret at the bottom of the whiteboard
                                _widget.dom.querySelector(".whiteboard .caret").classList.add("invisible");        
                        };
                        
                        // toggle whiteboard/writeup display
                        _widget.toggleCaret = function(event, node){
                                event.stopPropagation();
                                var _writeup = _widget.dom.querySelector(".writeup"),
                                    _whiteboard = _widget.dom.querySelector(".whiteboard");
                                node.classList.toggle("descending");
                                (node.classList.contains("descending")) ? _writeup.scrollIntoView() : _whiteboard.scrollIntoView();        
                        };
                        
                        // toggle view (same as caret) if user clicks on the bottom of the whiteboard
                        _widget.toggleView = function(event, node){
                                var caret = node.querySelector(".caret"),
                                    _writeup = _widget.dom.querySelector(".writeup"),
                                    _whiteboard = _widget.dom.querySelector(".whiteboard");
                                    
                                // if whiteboard is folded then diusplay it
                                if (caret.classList.contains("descending")){
                                        caret.classList.remove("descending");
                                        _whiteboard.scrollIntoView();
                                }
                                else{
                                        // else if touch event occurs near the bottom of the whiteboard
                                        if ( (event.pageY - node.scrollHeight) > 0){
                                                caret.classList.add("descending");
                                                _writeup.scrollIntoView();
                                        }
                                }
                        };
                        
                        // update database with scenario changes made by leader
                        _widget.updateIdea = function updateIdea(event, node){
                                _miInterval = setInterval(function(){
                                        var _sIdea = $session.get("idea")[0] || {title:"", description:"", solution:""},
                                            _title = _sIdea.title,
                                            _description = _sIdea.description,
                                            _solution = _sIdea.solution,
                                            cdbId = {};
                                        
                                        if (_idea.get("title") !== _title || _idea.get("description") !== _description || _idea.get("solution") !== _solution){
                                                cdbId.title = _idea.get("title");
                                                cdbId.description = _idea.get("description");
                                                cdbId.solution = _idea.get("solution");
                                                $session.set("idea", [cdbId]);
                                                $session.upload()
                                                .then(function(success){
                                                        return true;
                                                }, function(err){
                                                        console.log("failed to update idea", err);
                                                });
                                        }
                                }, 8000);        
                        };
                        
                        // update session score
                        _widget.updateSessionScore = function(timer){
                                var promise = new Promise(),
                                    json = {
                                        "sid": $session.get("_id"),
                                        "step": "muidea",
                                        "time": timer,
                                        "wbcontent": _wbContent.toJSON(),
                                        "idea": _idea.toJSON()
                                };
                                _transport.request("UpdateSessionScore", json, function(result){
                                        if (result.res === "ok"){
                                                $session.unsync();
                                                $session.sync(_db, $session.get("_id"))
                                                .then(function(){
                                                        promise.fulfill();        
                                                });
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
                                    auth = [],
                                    names = [],
                                    promise = new Promise();
                                    
                                auth.push($session.get("initiator").id);
                                names.push($session.get("initiator").username);
                                $session.get("participants").forEach(function(part){
                                        if (part.present){
                                                auth.push(part.id);
                                                names.push(part.username);
                                        }        
                                });
                                cdb.setTransport(_transport);
                                cdb.set("title", _idea.get("title"));
                                cdb.set("sessionId", $session.get("_id"));
                                cdb.set("authors", auth);
                                cdb.set("description", _idea.get("description"));
                                cdb.set("solution", _idea.get("solution"));
                                cdb.set("creation_date", [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]);
                                cdb.set("character", $session.get("characters")[0]);
                                cdb.set("problem", $session.get("problems")[0]);
                                cdb.set('context', $session.get("contexts")[0]);
                                cdb.set("techno", $session.get("techno")[0]);
                                cdb.set("visibility", _idea.get("visibility"));
                                cdb.set("sessionReplay", _idea.get("sessionReplay"));
                                cdb.set("authornames", names.join(", "));
                                //set the idea's language to the same language as the session
                                cdb.set("lang", $session.get("lang").substring(0,2));
                                cdb.set("_id", _id);
                                cdb.sync(Config.get("db"), _id)
                                .then(function(){
                                        return cdb.upload();
                                })
                                .then(function(){
                                        // updateUIP is visibility is public for leader and for participants
                                        if (cdb.get("visibility") === "public"){
                                                _transport.request("UpdateUIP", {"userid": _user.get("_id"), "type": cdb.get("type"), "docId": cdb.get("_id"), "docTitle": cdb.get("title")}, function(result){
                                                        if (result !== "ok") {console.log(result);}
                                                });
                                                // do the same for participants
                                                $session.get("participants").forEach(function(part){
                                                        _transport.request("UpdateUIP", {"userid": part.id, "type": cdb.get("type"), "docId": cdb.get("_id"), "docTitle": cdb.get("title")}, function(result){
                                                                if (result !== "ok") {console.log(part.id, " "+result);}
                                                        });        
                                                }); 
                                        }
                                        promise.fulfill();
                                        cdb.unsync();
                                });
                                return promise;
                        };
                        
                        // INIT muidea STEP
                        _widget.reset = function reset(replay){
                                
                                chatUI.clear();
                                if ($session.get("chat")[4]){
                                        chatUI.reset($session.get("chat")[4]);
                                }
                                
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
                                
                                // reset timer if previous session was exited while in muidea step
                                clearInterval(_miTimer);
                                
                                // if idea is present show write up interface and board in readonly mode
                                if (replay || $session.get("idea").length){
                                        // set _next to screen
                                        _next="screen"; 
                                        // expand chat read area in to cover write interface in case of replay
                                        chatUI.dom.querySelector(".chatread").classList.add("extended");
                                        _tools.set("ready", false);
                                        
                                        _widget.displayIdea();
                                        
                                        // in quick mode only one scenario is available
                                        _idea.reset($session.get("idea")[0]);
                                        // add it to the session data store
                                        $data.set("idea", $session.get("idea")[0]);
                                        // idea should be readonly
                                        _tools.set("readonly", true);
                                        // hide next button
                                        _tools.set("shownext", false);      
                                }
                                else{
                                        // idea fields are not uploaded separately        
                                        _idea.reset({"title" : "", "description" : "", "solution" : "", "visibility":"private"});
                                        (_wbContent.getNbItems()) ? _tools.set("ready", true) : _tools.set("ready", false);
                                        // remove readonly
                                        _wb.setReadonly(false);
                                        // set next to step
                                        _next="step";
                                        // set voted to false
                                        _voted = false;     
                                }
                                
                                // retrieve time already spent on this step and init/display timer as appropriate
                                if ($session.get("elapsedTimers").muidea ){
                                        _elapsed = $session.get("elapsedTimers").muidea;
                                        _timer.set("timer", _elapsed);
                                        if (_next === "screen"){
                                                _timer.set("display", true);
                                        }
                                        else if (_widget.isLeader()){
                                                _widget.initTimer(_elapsed);
                                        }
                                }
                         };
                         
                         _widget.initTimer = function(init){
                                var now = new Date(),
                                    _start = now.getTime(),
                                    elapsed = init || 0;
                                
                                _timer.set("display", false);
                                _timer.set("timer", elapsed);
                                // make sure current step is ongoing before restarting timer
                                if ($session.get("step") === "muidea"){
                                        _miTimer = setInterval(function(){
                                                var now = new Date();
                                                _timer.set("timer", elapsed + now.getTime()-_start);
                                        }, 1000);
                                }          
                         };
                        
                        // get session id and pass it to Whiteboard
                        $session.watchValue("_id", function(sid){
                                _wb.setSessionId(sid);        
                        });
                        
                        // reset chatUI
                        $session.watchValue("chat", function(arr){
                                if (arr.length === 5 && chatUI.getModel().get("_id") !== arr[4]){
                                        chatUI.reset(arr[4]);
                                }        
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
                                _wbContent.watch(change, function(val){
                                        if (!_tools.get("showidea")){
                                                // avoid upload if $session is already up-to-date (e.g. replay)
                                                if ($session.get("ideaWB").length !== _wbContent.getNbItems() || JSON.stringify($session.get("ideaWB")) !== _wbContent.toJSON()){
                                                        $session.set("ideaWB", JSON.parse(_wbContent.toJSON()));
                                                        $session.upload()
                                                        .then(function(response){
                                                                return "success";
                                                        }, function(response){
                                                                console.log("failure : ", response);
                                                        });
                                                }
                                        
                                                // toggle ready button
                                                (_wbContent.getNbItems()) ? _tools.set("ready", true) : _tools.set("ready", false);
                                        }     
                                });
                        });
                        
                        // update local whiteboard content as soon as it is updated in the database
                        $session.watchValue("ideaWB", function(content){
                                if ($session.get("step") === "muidea" && !_tools.get("showidea")){
                                        if (content.length && _wb.getStack().getCurrentName() === "default"){
                                                _wb.selectScreen("main");        
                                        }
                                        if (!content.length) {
                                                _wb.selectScreen("default");
                                        }
                                        if (content.length !== _wbContent.getNbItems() || JSON.stringify(content) !== _wbContent.toJSON()){
                                                _wbContent.reset(content);       
                                        }
                                }
                        });
                        
                        // display write up interface once the leader has "closed" the whiteboard
                        $session.watchValue("ideaReady", function(ready){
                                if ($session.get("step") === "muidea" && ready && !_widget.isLeader()){
                                        _tools.set("readonly", true);
                                        _widget.displayIdea();        
                                } 
                        });
                        
                        // display leader updates made to the scenario
                        $session.watchValue("idea", function(arr){
                                if (!_widget.isLeader()) {
                                        _idea.reset(arr[0]);
                                         $data.set("idea", JSON.parse(_idea.toJSON()));
                                }        
                        });
                        
                        // watch contents of idea and display next button if ready
                        _idea.watch("updated", function(){
                                        (_widget.isLeader() && _idea.get("title") && _idea.get("description") && _idea.get("solution")) ? _tools.set("shownext", true) : _tools.set("shownext", false);
                        });
                        
                        // watch for voting event (if not the session leader)
                        $session.watchValue("vote", function(vote){
                                if (vote && !_voted && !_widget.isLeader() && !voteUI.isActive()){
                                        voteUI.reset($session, function(result){
                                                if (result) voteUI.close();
                                        });
                                        _voted = true;      
                                }
                        });
                        
                        // Return
                        return _widget;
                };    
        });
