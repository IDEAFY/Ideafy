define("Ideafy/Brainstorm/QuickScenario", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store", "CouchDBStore", "Ideafy/CardPopup", "Ideafy/Whiteboard", "Promise"],
        function(Widget, Map, Model, Event, Config, Store, CouchDBStore, CardPopup, Whiteboard, Promise){
                
                return function QuickScenarioConstructor($session, $data, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _popupUI, _currentPopup,
                             _labels = Config.get("labels"),
                             _char = new Store(), _context = new Store(), _problem = new Store(),
                             _cards = new Store({
                                     "char": {"id":"", "title": "", "pic": ""},
                                     "context": {"id":"", "title": "", "pic": ""},
                                     "problem": {"id":"", "title": "", "pic": ""}
                                     }),
                             _tools = new Store(
                                     {"cardpopup":{"char":false, "context":false, "problem":false}},
                                     {"postit": "inactive"},
                                     {"import": "inactive"},
                                     {"drawing": "inactive"},
                                     {"ready": false}, // display finish button
                                     {"showstory": false}, // display write up interface
                                     {"shownext" : false}, // display next button
                                     {"readonly" : false} // set story textareas in readonly mode
                                     ),
                            _scenario = new Store({"title" : "", "story" : "", "solution" : ""}),
                            _wbContent = new Store([]), // a store of whiteboard objects
                            _wb = new Whiteboard("scenario", _wbContent, _tools),
                            _start,
                            _next = "step", // used to prevent multiple clicks/uploads on next button --> toggles "step"/"screen"
                            _transport = Config.get("transport"),
                            _elapsed = 0;
                             
                        
                        
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
                                                (ready) ? this.classList.remove("invisible") : this.classList.add("invisible");
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
                                "scenario" : new Model(_scenario),
                                "wbstack" : _wb,
                                "quickscenarioevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickscenario"><div class="previousbutton" data-quickscenarioevent="listen: touchstart, press; listen: touchstart, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickscenario" data-quickscenarioevent="listen:touchstart, toggleProgress"></div><div id="quickscenario-left" class="leftarea"><div class = "card char" data-wbtools="bind:popup,cardpopup.char" name="char" data-quickscenarioevent="listen:touchstart, zoom"><div class="cardpicture" data-cards="bind:setPic,char.pic"></div><div class="cardtitle" data-cards="bind:formatTitle,char.title">Character</div></div><div class="card context" name="context" data-wbtools="bind: popup,cardpopup.context" data-quickscenarioevent="listen:touchstart, zoom"><div class="cardpicture" data-cards="bind:setPic,context.pic"></div><div class="cardtitle" data-cards="bind: formatTitle,context.title">Context</div></div><div class="card problem" name="problem" data-wbtools="bind:popup, cardpopup.problem" data-quickscenarioevent="listen:touchstart, zoom"><div class="cardpicture" data-cards="bind:setPic,problem.pic"></div><div class="cardtitle" data-cards="bind:formatTitle,problem.title">Problem</div></div></div><div id="quickscenario-popup"></div><div id="quickscenario-right" class="workarea"><div id="scenario-whiteboard" class="whiteboard"><div class="stack" data-wbstack="destination"></div></div><div id="toolbox" data-wbtools="bind:toggleToolbox, showstory"><div class="toolbox-button"><div class="postit-button" name="postit" data-wbtools="bind:setActive, postit" data-quickscenarioevent="listen: touchstart, push; listen:touchend, post"></div><legend>Post-it</legend></div><div class="toolbox-button"><div class="importpic-button" name="import" data-wbtools="bind:setActive, import" data-quickscenarioevent="listen: touchstart, push; listen:touchend, importpic"></div><legend>Import pictures</legend></div><div class="toolbox-button"><div class="drawingtool-button" name="drawing" data-wbtools="bind:setActive, drawing" data-quickscenarioevent="listen: touchstart, push; listen:touchend, draw"></div><legend>Drawing tool</legend></div></div><div id="finish-button" class="invisible" data-wbtools="bind:setReady, ready" data-labels="bind:innerHTML, finishbutton" data-quickscenarioevent="listen: touchstart, press; listen:touchend, finish"></div><div id = "quickscenario-writeup" class="writeup invisible" data-wbtools="bind: setReady,showstory"><textarea class = "enterTitle" data-labels="bind:setPlaceholder, storytitleplaceholder" data-scenario="bind:value, title" data-wbtools="bind:setReadonly, readonly"></textarea><div class="setPrivate"></div><div class="setPublic"></div><textarea class = "enterDesc" data-labels="bind:setPlaceholder, storydescplaceholder" data-scenario="bind:value, story" data-wbtools="bind:setReadonly, readonly"></textarea><textarea class = "enterSol" data-labels="bind:setPlaceholder, storysolplaceholder" data-scenario="bind:value, solution" data-wbtools="bind:setReadonly, readonly"></textarea><div class = "finish-button finish-writeup"></div></div><div class="next-button invisible" data-wbtools="bind:setReady, shownext" data-labels="bind:innerHTML, nextbutton" data-quickscenarioevent="listen: touchstart, press; listen:touchend, next"></div></div></div>';
                        
                        _widget.place(Map.get("quickscenario"));
                        
                        // function called when pressing a button (next or finish)
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        // move to next screen
                        _widget.next = function(event, node){
                                var now = new Date(), _timers;
                                
                                node.classList.remove("pressed");
                                // if first time: upload scenario and set readonly
                                if (_next === "step"){
                                        _next = "screen";
                                        // compute elapsed time
                                        _timers = $session.get("elapsedTimers");
                                        _timers.quickscenario = _elapsed + now.getTime() - _start;
                                        // update session score
                                        _widget.updateSessionScore(_timers.quickscenario).then(function(){
                                                // resync with db
                                                $session.unsync();
                                                $session.sync(Config.get("db"), $session.get("_id")).then(function(){
                                                        // update session document
                                                        $session.set("scenario", [JSON.parse(_scenario.toJSON())]);
                                                        $session.set("elapsedTimers", _timers);
                                                        $next("quickscenario");         
                                                });      
                                        });
                                }
                                else $next("quickscenario");
                        };
                        
                        // move to previous screen
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickscenario");
                        };
                        
                        // toggle progress bar
                        _widget.toggleProgress = function(event, node){
                                $progress(node);               
                        };
                        
                        // function called when selecting one of the scenario tools
                        _widget.push = function(event, node){
                                var name = node.getAttribute("name");
                                _tools.set(name,"active");
                        };
                        
                        // zoom on selected card
                        _widget.zoom = function(event, node){
                                var type = node.getAttribute("name");
                                _widget.setPopup(type);        
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
                                        _popupUI.reset(details, pos, caret, document.getElementById("quickscenario-popup"));
                                }
                                // else fetch card details in couchDB
                                else{
                                        cdb = new CouchDBStore();
                                        cdb.setTransport(_transport);
                                        cdb.sync(Config.get("db"), card.id).then(function(){
                                                details = cdb.toJSON();
                                                _popupUI.reset(details, pos, caret, document.getElementById("quickscenario-popup"));
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
                                _tools.set("showstory", true);      
                        };
                        
                        // update session score
                        _widget.updateSessionScore = function(timer){
                                var promise = new Promise(),
                                    json = {
                                        "sid": $session.get("_id"),
                                        "step": "quickscenario",
                                        "time": timer,
                                        "wbcontent": _wbContent.toJSON(),
                                        "scenario": _scenario.toJSON()
                                };
                                _transport.request("UpdateSessionScore", json, function(result){
                                        if (result.res === "ok"){
                                                promise.resolve();
                                        }
                                        else {
                                                promise.reject();
                                        }
                                });
                                return promise;        
                        };
                        
                        // INIT SCENARIO
                        // Initializing the QuickScenario UI
                        _widget.reset = function reset(sip){
                                // reset all tools and status indicators
                                _tools.reset({"cardpopup":{"char":false, "context":false, "problem":false}},{"postit": "inactive"},{"import": "inactive"},{"drawing": "inactive"},{"ready": false},{"showstory": false},{"shownext" : false},{"readonly" : false});
                                
                                // reset whiteboard (if sip, need to show existing content)
                                _wb.setSessionId($session.get("_id"));
                                _wbContent.reset($session.get("scenarioWB"));
                                (_wbContent.getNbItems()) ? _wb.selectScreen("main") : _wb.selectScreen("default");
                                
                                // if scenario is present show write up interface and board in readonly mode
                                if ($session.get("scenario").length){
                                        _tools.set("showstory", true);
                                        _wb.setReadonly(true);
                                        // in quick mode only one scenario is available
                                        _scenario.reset($session.get("scenario")[0]);
                                        // story should be readonly
                                        _tools.set("readonly", true);
                                        _tools.set("shownext", true);
                                        // set _next to screen
                                        _next="screen";       
                                }
                                else{
                                        // scenario fields are not uploaded separately        
                                        _scenario.reset({"title" : "", "story" : "", "solution" : ""});
                                        (_wbContent.getNbItems()) ? _tools.set("ready", true) : _tools.set("ready", false);
                                        // remove readonly
                                        _wb.setReadonly(false);
                                        // set next to step
                                        _next="step";     
                                }
                                // retrieve time already spent on this step
                                ($session.get("elapsedTimers").quickscenario) ? _elapsed = $sesion.get("elapsedTimers").quickscenario : _elapsed = 0;
                         };
                         
                         _widget.initTimer = function(param){
                                var now = new Date();
                                _start = now.getTime();
                                (param) ? _elapsed = param : _elapsed = 0;             
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
                        
                        // upload whiteboard content to database as soon as it is updated
                        ["added", "deleted", "updated"].forEach(function(change){
                                _wbContent.watch(change, function(){
                                        $session.set("scenarioWB", JSON.parse(_wbContent.toJSON()));
                                        $session.upload();
                                        
                                        // toggle ready button
                                        (_wbContent.getNbItems()) ? _tools.set("ready", true) : _tools.set("ready", false);     
                                });  
                        });
                        
                        // watch contents of scenario and display next button if ready
                        _scenario.watch("updated", function(){
                                        (_scenario.get("title") && _scenario.get("story") && _scenario.get("solution")) ? _tools.set("shownext", true) : _tools.set("shownext", false);
                        });
                        
                        // Return
                        return _widget;
                };     
        });
