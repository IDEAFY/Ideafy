/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "Place.plugin", "service/config", "Store", "CouchDBDocument", "service/cardpopup", "../../whiteboard/whiteboard", "Promise", "service/utils", "lib/spin.min", "./mubchat"],
        function(Widget, Map, Model, Event, Place, Config, Store, CouchDBDocument, CardPopup, Whiteboard, Promise, Utils, Spinner, Chat){
                
                return function MUScenarioConstructor($session, $data, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _popupUI, _currentPopup,
                            chatUI = new Chat(),
                             _labels = Config.get("labels"),
                             _user = Config.get("user"),
                             _char = new Store(), _context = new Store(), _problem = new Store(),
                             _cards = new Store({
                                     "char": {"id":"", "title": "", "pic": ""},
                                     "context": {"id":"", "title": "", "pic": ""},
                                     "problem": {"id":"", "title": "", "pic": ""}
                                     }),
                             _initTools = {
                                     "cardpopup":{"char":false, "context":false, "problem":false},
                                     "postit": "inactive",
                                     "import": "inactive",
                                     "drawing": "inactive",
                                     "ready": false, // display finish button
                                     "showstory": false, // display write up interface
                                     "shownext" : false, // display next button
                                     "readonly" : false // set story textareas in readonly mode
                             },
                             _tools = new Store(_initTools),
                            _timer = new Store({"timer":null, "display":false}),
                            _mscTimer, _mscInterval,
                            _scenario = new Store({"title" : "", "story" : "", "solution" : ""}),
                            _wbContent = new Store([]), // a store of whiteboard objects
                            _wb = new Whiteboard("scenario", _wbContent, _tools),
                            _start, _elapsed = 0,
                            _next = "step", // used to prevent multiple clicks/uploads on next button --> toggles "step"/"screen"
                            _transport = Config.get("transport"),
                            spinner = new Spinner({color:"#657B99", lines:10, length: 8, width: 4, radius:8, top: 695, left: 670}).spin();
                            // deduct 20px from position shown in navigator 
                             
                        
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
                                "cards" : new Model(_cards, {
                                        formatTitle : function(title){
                                                if (title) {
                                                        this.innerHTML = title.substring(0,1).toUpperCase()+title.substring(1).toLowerCase(); 
                                                        }       
                                        },
                                        setPic : function(pic){
                                                if (pic){
                                                        this.setAttribute("style", "background-image:url('"+pic+"');");
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
                                        showStory : function(showstory){
                                                (showstory) ? this.classList.remove("invisible") : this.classList.add("invisible");        
                                        },
                                        toggleToolbox : function(showstory){
                                                (showstory) ? this.classList.add("invisible") : this.classList.remove("invisible");
                                        },
                                        setReadonly : function(readonly){
                                                (readonly)?this.setAttribute("readonly", "readonly"):this.removeAttribute("readonly");
                                        },
                                        popup : function(pop){
                                                (pop) ? this.classList.add("highlighted") : this.classList.remove("highlighted");
                                        }
                                }),
                                "muscenariotimer" : new Model(_timer, {
                                      setTime: function(timer){
                                                      this.innerHTML = Utils.formatDuration(timer);       
                                      },
                                      displayTimer: function(display){
                                              (display) ? this.classList.add("showtimer") : this.classList.remove("showtimer");
                                      }
                                }),
                                "scenario" : new Model(_scenario),
                                "wbstack" : _wb,
                                "place" : new Place({"chat": chatUI}),
                                "muscenarioevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "muscenario"><div class="previousbutton" data-muscenarioevent="listen: touchstart, press; listen: touchstart, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, muscenario" data-muscenarioevent="listen:touchstart, toggleProgress"></div><div class="timer" data-muscenariotimer="bind:setTime, timer; bind: displayTimer, display" data-muscenarioevent="listen:touchstart,toggleTimer"></div><div id="muscenario-left"><div class="scenario-cards leftarea folded" data-muscenarioevent="listen:touchstart, fold"><div class = "card char" data-wbtools="bind:popup,cardpopup.char" name="char" data-muscenarioevent="listen:touchstart, zoom"><div class="cardpicture" data-cards="bind:setPic,char.pic"></div><div class="cardtitle" data-cards="bind:formatTitle,char.title">Character</div></div><div class="card context" name="context" data-wbtools="bind: popup,cardpopup.context" data-muscenarioevent="listen:touchstart, zoom"><div class="cardpicture" data-cards="bind:setPic,context.pic"></div><div class="cardtitle" data-cards="bind: formatTitle,context.title">Context</div></div><div class="card problem" name="problem" data-wbtools="bind:popup, cardpopup.problem" data-muscenarioevent="listen:touchstart, zoom"><div class="cardpicture" data-cards="bind:setPic,problem.pic"></div><div class="cardtitle" data-cards="bind:formatTitle,problem.title">Problem</div></div><div class="caret"></div></div><div id="muscenario-popup"></div><div class ="toolbox" data-wbtools="bind:toggleToolbox, showstory"><div class="toolbox-button"><div class="postit-button" name="postit" data-wbtools="bind:setActive, postit" data-muscenarioevent="listen: touchstart, push; listen:touchend, post"></div><legend>Post-it</legend></div><div class="toolbox-button"><div class="importpic-button" name="import" data-wbtools="bind:setActive, import" data-muscenarioevent="listen: touchstart, push; listen:touchend, importpic"></div><legend>Import pictures</legend></div><div class="toolbox-button"><div class="drawingtool-button" name="drawing" data-wbtools="bind:setActive, drawing" data-muscenarioevent="listen: touchstart, push; listen:touchend, draw"></div><legend>Drawing tool</legend></div><div class="finish-button invisible" data-wbtools="bind:setReady, ready" data-labels="bind:innerHTML, finishbutton" data-muscenarioevent="listen: touchstart, press; listen:touchend, finish"></div></div></div><div id="muscenario-right" class="workarea"><div id="scenario-whiteboard" class="whiteboard" data-muscenarioevent = "listen:touchstart, toggleView"><div class="stack" data-wbstack="destination"></div><div class="caret descending invisible" data-muscenarioevent="listen:touchstart, toggleCaret"></div></div><div id = "muscenario-writeup" class="writeup invisible" data-wbtools="bind: showStory,showstory"><textarea class = "enterTitle" maxlength="30" data-labels="bind:setPlaceholder, storytitleplaceholder" data-scenario="bind:value, title" data-wbtools="bind:setReadonly, readonly" data-muscenarioevent="listen:blur, updateScenario"></textarea><div class="setPrivate"></div><div class="setPublic"></div><textarea class = "enterDesc" data-labels="bind:setPlaceholder, storydescplaceholder" data-scenario="bind:value, story" data-wbtools="bind:setReadonly, readonly" data-muscenarioevent="listen:blur, updateScenario"></textarea><textarea class = "enterSol" data-labels="bind:setPlaceholder, storysolplaceholder" data-scenario="bind:value, solution" data-wbtools="bind:setReadonly, readonly" data-muscenarioevent="listen:blur, updateScenario"></textarea></div><div class="next-button invisible" data-wbtools="bind:setReady, shownext" data-labels="bind:innerHTML, nextbutton" data-muscenarioevent="listen: touchstart, press; listen:touchend, next"></div></div><div class="sessionchat" data-place="place:chat"></div></div>';
                        
                        _widget.place(Map.get("muscenario"));
                        
                        // function called when pressing a button (next or finish)
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        // identify if user is the current session leader
                        _widget.isLeader = function isLeader(){
                                return ($session.get("initiator") && $session.get("initiator").id === _user.get("_id"));
                        };
                        
                        // move to next screen
                        _widget.next = function(event, node){
                                
                                spinner.spin(node.parentNode);
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                                
                                // if first time: upload scenario and set readonly
                                if (_next === "step"){
                                        _next = "screen";
                                        
                                        // stop timer and update display
                                        clearInterval(_mscTimer);
                                        _timer.set("display", true);
                                        
                                        // stop scenario autoupdates
                                        clearInterval(_mscInterval);
                                        
                                        // add scenario to session data
                                        $data.set("scenario", JSON.parse(_scenario.toJSON()));
                                        
                                        console.log(_scenario.toJSON());
                                        // update session score
                                        _widget.updateSessionScore(_timer.get("timer"))
                                        .then(function(){
                                               // resync with db
                                                $session.unsync();
                                                return $session.sync(Config.get("db"), $session.get("_id"))
                                        })
                                        .then(function(){
                                                var timers;
                                                // notify participants via chat
                                                chatUI.conclude("next");
                                                // update session document
                                                timers = $session.get("elapsedTimers");
                                                timers.muscenario = _timer.get("timer");
                                                $session.set("elapsedTimers", timers);
                                                _tools.set("readonly", true);
                                                $next("muscenario");         
                                        });
                                }
                                else {
                                        $next("muscenario");
                                }
                        };
                        
                        _widget.stopSpinner = function stopSpinner(){
                                spinner.stop();
                        };
                        
                        // move to previous screen
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("muscenario");
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
                        
                        // function called when selecting one of the scenario tools
                        _widget.push = function(event, node){
                                var name = node.getAttribute("name");
                                _tools.set(name,"active");
                        };
                        
                        // zoom on selected card
                        _widget.zoom = function(event, node){
                                event.stopPropagation();
                                var type = node.getAttribute("name");
                                _widget.setPopup(type);        
                        };
                        
                        // show/hide the setup cards
                        _widget.fold = function(event, node){
                                // disable toggle in scenario write up phase
                                if (!$session.get("scReady")){
                                        node.classList.toggle("folded");
                                        node.querySelector(".caret").classList.toggle("folding");
                                        // hide card popup if present
                                        if (_currentPopup){
                                                _popupUI.close();
                                        }
                                }
                        };
                        
                        // Method called to initialize a card popup
                        _widget.setPopup = function setPopup(type){
                                var pos = {x:240, y: 130}, // the position of the popup
                                    caret = "left", // the position of the caret
                                    card = _cards.get(type),
                                    popup = _tools.get("cardpopup"),
                                    details = "", // the contents of the cards
                                    cdb; // if content needs to be retrieved from database
                                
                                // reset previous card if any
                                if (_currentPopup) popup[_currentPopup] = false;
                                popup[type] = true;
                                _tools.set("cardpopup", popup);
                                _currentPopup = type;
                                if (type === "char") {
                                        pos.y = 120;
                                        if (card.id === _char.get("_id")) details = _char.toJSON();
                                }
                                if (type === "context") {
                                        pos.y = 290;
                                        if (card.id === _context.get("_id")) details = _context.toJSON();
                                }
                                if (type === "problem") {
                                        pos.y = 350;
                                        if (card.id === _problem.get("_id")) details = _problem.toJSON();
                                }
                                // only display popup if a card is present
                                if (details){
                                        _popupUI.reset(details, pos, caret, document.getElementById("muscenario-popup"));
                                }
                                // else fetch card details in couchDB
                                else{
                                        cdb = new CouchDBDocument();
                                        cdb.setTransport(_transport);
                                        cdb.sync(Config.get("db"), card.id).then(function(){
                                                details = cdb.toJSON();
                                                _popupUI.reset(details, pos, caret, document.getElementById("muscenario-popup"));
                                                // save contents in the appropriate local store for further use
                                                if (type === "char"){
                                                        _char.reset(JSON.parse(cdb.toJSON()));
                                                }
                                                if (type === "context"){
                                                        _context.reset(JSON.parse(cdb.toJSON()));
                                                }
                                                if (type === "problem"){
                                                        _problem.reset(JSON.parse(cdb.toJSON()));
                                                }             
                                        });  
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
                        
                        // Getting the chat UI
                        _widget.getChatUI = function getChatUI(){
                                return ChatUI;        
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
                                $session.sync(Config.get("db"), $session.get("_id"))
                                .then(function(){
                                        $session.set("scReady", true);
                                        return $session.upload();       
                                })
                                .then(function(){
                                        finishSpinner.stop();
                                        // reset and hide finish button
                                        node.classList.remove("pressed");
                                        _tools.set("ready", false);
                                
                                        _widget.displayStory();
                                        // monitor scenario updates if user is the session leader
                                        _widget.updateScenario();       
                                });
                        };
                        
                        // function called to display the story writeup interface
                        _widget.displayStory = function displayStory(){
                                // change whiteboard mode to readonly
                                _wb.setReadonly(true);
                                // hide toolbox and show writeup interface
                                _tools.set("showstory", true);
                                // removed folded class from scenario cards
                                _widget.dom.querySelector(".scenario-cards").classList.remove("folded");
                                _widget.dom.querySelector(".scenario-cards .caret").classList.add("invisible");
                                // display writeup interface
                                _widget.dom.querySelector(".writeup").scrollIntoView();
                                // display caret at the bottom of the whiteboard
                                _widget.dom.querySelector(".whiteboard .caret").classList.remove("invisible");
                        };
                        
                        // function to reset / hide story
                        _widget.hideStory = function hideStory(){
                                // add folded class to scenario cards
                                _widget.dom.querySelector(".scenario-cards").classList.add("folded");
                                _widget.dom.querySelector(".scenario-cards .caret").classList.remove("invisible");
                                
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
                        _widget.updateScenario = function updateScenario(){
                                clearInterval(_mscInterval);
                                _mscInterval = setInterval(function(){
                                        var _title = _widget.dom.querySelector(".enterTitle").value,
                                            _story = _widget.dom.querySelector(".enterDesc").value,
                                            _solution = _widget.dom.querySelector(".enterSol").value,
                                            cdbScen = {};
                                        
                                        if (_scenario.get("title") !== _title || _scenario.get("story") !== _story || _scenario.get("solution") !== _solution){
                                                cdbScen.title = _title;
                                                cdbScen.story = _story;
                                                cdbScen.solution = _solution;
                                                $session.unsync();
                                                $session.sync(Config.get("db"), $session.get("_id"))
                                                .then(function(){
                                                        $session.set("scenario", [cdbScen]);
                                                        return $session.upload();
                                                })
                                                .then(function(success){
                                                        console.log("scenario updated in CouchDB");
                                                        return true;
                                                }, function(err){
                                                        console.log("failed to update scenario", err);
                                                });
                                        }
                                }, 10000);        
                        };
                        
                        // update session score
                        _widget.updateSessionScore = function(timer){
                                var promise = new Promise(),
                                    json = {
                                        "sid": $session.get("_id"),
                                        "step": "muscenario",
                                        "time": timer,
                                        "wbcontent": _wbContent.toJSON(),
                                        "scenario": _scenario.toJSON()
                                };
                                _transport.request("UpdateSessionScore", json, function(result){
                                        console.log(result);
                                        if (result.res === "ok"){
                                                promise.fulfill();
                                        }
                                        else {
                                                promise.reject();
                                        }
                                });
                                return promise;        
                        };
                        
                        // INIT SCENARIO
                        // Initializing the muscenario UI
                        _widget.reset = function reset(replay){
                                console.log("reset muscenario : ", $session.toJSON());
                                // retrieve chat document
                                if ($session.get("chat")[2]){
                                        chatUI.reset($session.get("chat")[2]);
                                }
                                
                                // reset all tools and status indicators
                                _tools.reset({
                                     "cardpopup":{"char":false, "context":false, "problem":false},
                                     "postit": "inactive",
                                     "import": "inactive",
                                     "drawing": "inactive",
                                     "ready": false, // display finish button
                                     "showstory": false, // display write up interface
                                     "shownext" : false, // display next button
                                     "readonly" : false // set story textareas in readonly mode
                                });
                                
                                // reset whiteboard (if sip, need to show existing content)
                                _wb.setSessionId($session.get("_id"));
                                _wbContent.reset($session.get("scenarioWB"));
                                (_wbContent.getNbItems()) ? _wb.selectScreen("main") : _wb.selectScreen("default");
                                
                                // if scenario is present show write up interface and board in readonly mode
                                if ($session.get("scenario").length){                                        
                                        // set _next to screen
                                        _next="screen";
                                        _tools.set("ready", false);
                                        
                                        // shown write up interface
                                        _widget.displayStory();
                                        
                                        // story should be readonly
                                        _tools.set("readonly", true);
                                        _tools.set("shownext", true);
                                        
                                        // in quick mode only one scenario is available
                                        _scenario.reset($session.get("scenario")[0]);
                                        
                                        // add scenario to session data
                                        $data.set("scenario", $session.get("scenario")[0]);
                                        
                                }
                                else{
                                        // scenario fields are not uploaded separately        
                                        _scenario.reset({"title" : "", "story" : "", "solution" : ""});
                                        (_wbContent.getNbItems()) ? _tools.set("ready", true) : _tools.set("ready", false);
                                        // remove readonly
                                        _wb.setReadonly(false);
                                        // hide/reset story interface
                                        _widget.hideStory();
                                        // set next to step
                                        _next="step";     
                                }
                                // retrieve time already spent on this step and init/display timer as appropriate
                                if ($session.get("elapsedTimers").muscenario ){
                                        _elapsed = $session.get("elapsedTimers").muscenario;
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
                                if ($session.get("step") === "muscenario"){
                                        clearInterval(_mscTimer);
                                        _mscTimer = setInterval(function(){
                                                var now = new Date();
                                                _timer.set("timer", elapsed + now.getTime()-_start);
                                        }, 1000);
                                }           
                         };
                        
                        // get selected cards
                        $data.watchValue("characters", function(value){
                                // in the case of a  quick brainstorm there is only one character
                                _cards.set("char", value);       
                        });
                        $data.watchValue("contexts", function(value){
                                _cards.set("context", value);       
                        });
                        $data.watchValue("problems", function(value){
                                _cards.set("problem", value);
                        });
                        
                        // get session id and pass it to Whiteboard
                        $session.watchValue("_id", function(sid){
                                _wb.setSessionId(sid);        
                        });
                        
                        // reset chatUI
                        $session.watchValue("chat", function(arr){
                                if (arr.length === 3 && chatUI.getModel().get("_id") !== arr[2]){
                                        chatUI.reset(arr[2]);
                                }        
                        });
                        
                        // upload whiteboard content to database as soon as it is updated locally
                        ["added", "deleted", "updated"].forEach(function(change){
                                _wbContent.watch(change, function(){
                                        
                                        // avoid upload if $session is already up-to-date (e.g. replay)
                                        if ($session.get("scenarioWB") !== _wbContent.getNbItems() || JSON.stringify($session.get("scenarioWB")) !== _wbContent.toJSON()){
                                                $session.set("scenarioWB", JSON.parse(_wbContent.toJSON()));
                                                $session.upload();
                                        }
                                        else{
                                                console.log("no upload required");
                                        }
                                        
                                        // toggle ready button
                                        (_wbContent.getNbItems() && _next === "step") ? _tools.set("ready", true) : _tools.set("ready", false);     
                                });  
                        });
                        
                        // uopdate local whiteboard content as soon as it is updated in the database
                        $session.watchValue("scenarioWB", function(content){
                                if (content.length && _wb.getCurrentName() === "default"){
                                        _wb.selectScreen("main");        
                                }
                                else {
                                        _wb.selectScreen("default");
                                }
                                if (content.length !== _wbContent.getNbItems() || JSON.stringify(content) !== _wbContent.toJSON()){
                                        _wbContent.reset(content);       
                                }
                        });
                        
                        // display wrote up interface once the leader has "closed" the whiteboard
                        $session.watchValue("scReady", function(ready){
                                if (ready && !_widget.isLeader()){
                                        _tools.set("readonly", true);
                                        _widget.displayStory();        
                                } 
                        });
                        
                        // display leader updates made to the scenario
                        $session.watchValue("scenario", function(arr){
                                if (!_widget.isLeader()) {
                                        _scenario.reset(arr[0]);
                                }        
                        });
                        
                        // watch contents of scenario and display next button if ready
                        _scenario.watch("updated", function(){
                                        (_widget.isLeader() && _scenario.get("title") && _scenario.get("story") && _scenario.get("solution")) ? _tools.set("shownext", true) : _tools.set("shownext", false);
                        });
                        
                        // Return
                        return _widget;
                };     
        });