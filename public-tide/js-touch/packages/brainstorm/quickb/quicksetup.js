/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "CouchDBDocument", "Store", "Promise", "service/cardpopup", "service/help", "service/utils", "lib/spin.min"],
        function(Widget, Map, Model, Event, Config, CouchDBDocument, Store, Promise, CardPopup, Help, Utils, Spinner){
                
                return function QuickSetupConstructor($session, $data, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _popupUI,
                            _dom = Map.get("quicksetup"),
                            _labels = Config.get("labels"),
                            _transport = Config.get("transport"), _db = Config.get("db"), _user = Config.get("user"),
                            _deckStack = {}, // the cards remaining in the stack after each draw
                            _timer = new Store({"timer":null, "display":false}),
                            _qsTimer,
                            _selection = new Store({
                                     char : {selected: false, left: null, popup: false},
                                     context : {selected: false, left: null, popup: false},
                                     problem : {selected: false, left: null, popup: false}
                                     }),
                            _cards = new Store({
                                     char : {id:"",title:_labels.get("char"), pic: ""},
                                     context : {id:"",title:_labels.get("context"), pic: ""},
                                     problem : {id:"",title:_labels.get("problem"), pic: ""}
                                     }),
                            _drawnCards = {"char": 0, "context": 0, "problem" : 0},
                            _ready = true, // ready to draw a new card 
                            _currentCards = {"char": new Store(), "context": new Store(), "problem": new Store()}, // used for zoom
                            _currentPopup = "", // which card if any is magnified
                            _start =  null, _elapsed = 0,
                            _next = "step", // used to prevent multiple clicks/uploads on next button --> toggles "step"/"screen"
                            spinner = new Spinner({color:"#657B99", lines:10, length: 8, width: 4, radius:8, top: 373, left:373}).spin();
                            // deduct 20px from position shown in navigator
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "quicksetup" : new Model(_selection, {
                                        setReload : function(left){
                                                (left === 0) ? this.classList.add("reload") : this.classList.remove("reload");
                                        },
                                        updateNext : function(selected){
                                                (_selection.get("char").selected && _selection.get("context").selected && _selection.get("problem").selected) ? this.classList.remove("invisible"):this.classList.add("invisible");
                                        },
                                        popup : function(pop){
                                                (pop) ? this.classList.add("highlighted") : this.classList.remove("highlighted");
                                        },
                                        setSelected : function(selected){
                                                (selected)?this.classList.add("pushed"):this.classList.remove("pushed");
                                        }
                                }),
                                "quicksetuptimer" : new Model(_timer, {
                                      setTime: function(timer){
                                                      this.innerHTML = Utils.formatDuration(timer);       
                                      },
                                      displayTimer: function(display){
                                              (display) ? this.classList.add("showtimer") : this.classList.remove("showtimer");
                                      }
                                }),
                                "quicksetupcards" : new Model(_cards,{
                                        removeDefault : function(pic){
                                                (pic) ? this.classList.remove("defaultcard") : this.classList.add("defaultcard");                
                                        },
                                        formatTitle : function(title){
                                                if (title) {
                                                        this.innerHTML = title.substring(0,1).toUpperCase()+title.substring(1).toLowerCase(); 
                                                        }
                                                else this.innerHTML = title;   
                                        },
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
                                                        this.setAttribute("style", "background-image: none;")
                                                }
                                        }                                        
                                }),
                                "quicksetupevent": new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quicksetup"><div class="previousbutton" data-quicksetupevent="listen: touchstart, press; listen: touchstart, prev"></div><div id="quicksetup-popup" class="invisible"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quicksetup" data-quicksetupevent="listen:touchstart, toggleProgress"></div><div class="timer" data-quicksetuptimer="bind:setTime, timer; bind: displayTimer, display" data-quicksetupevent="listen:touchstart,toggleTimer"></div><div class="help-brainstorm" data-quicksetupevent="listen:touchstart, help"></div><div class="drawarea"><div class="decks"><div class="drawbutton drawchar" name="char" data-quicksetupevent="listen: touchstart, push; listen:touchend, draw" data-quicksetup="bind: setReload, char.left"></div><div class="drawbutton drawcontext" name="context" data-quicksetupevent="listen: touchstart, push; listen:touchend, draw" data-quicksetup="bind:setReload, context.left"></div><div class="drawbutton drawproblem" name="problem" data-quicksetupevent="listen: touchstart, push; listen:touchend, draw" data-quicksetup="bind:setReload, problem.left"></div></div><div class="cards"><div class="card char defaultcard" name="char" data-quicksetupevent="listen:touchstart, zoom" data-quicksetupcards="bind:removeDefault, char.pic" data-quicksetup="bind: popup, char.popup"><div class="cardpicture" data-quicksetupcards="bind: setPic, char.pic"></div><div class="cardtitle" data-quicksetupcards="bind:formatTitle, char.title">Character</div></div><div class="card context defaultcard" name="context" data-quicksetupevent="listen:touchstart, zoom" data-quicksetupcards="bind:removeDefault, context.pic" data-quicksetup="bind: popup, context.popup"><div class="cardpicture" data-quicksetupcards="bind: setPic, context.pic"></div><div class="cardtitle" data-quicksetupcards="bind:formatTitle, context.title">Context</div></div><div class="card problem defaultcard" name="problem" data-quicksetupevent="listen:touchstart, zoom" data-quicksetupcards="bind:removeDefault, problem.pic" data-quicksetup="bind: popup, problem.popup"><div class="cardpicture" data-quicksetupcards="bind: setPic, problem.pic"></div><div class="cardtitle" data-quicksetupcards="bind:formatTitle, problem.title">Problem</div></div></div><div class="confirmdraw"><div class="drawok" name="char" data-quicksetup="bind:setSelected, char.selected" data-quicksetupevent="listen: touchstart, push; listen:touchend, accept"></div><div class="drawok" name="context" data-quicksetup="bind:setSelected, context.selected" data-quicksetupevent="listen: touchstart, push; listen:touchend, accept"></div><div class="drawok" name="problem" data-quicksetup="bind:setSelected, problem.selected" data-quicksetupevent="listen: touchstart, push; listen:touchend, accept"></div></div><div class="next-button invisible" data-labels="bind:innerHTML, nextbutton" data-quicksetupevent="listen: touchstart, press; listen:touchend, next" data-quicksetup="bind:updateNext, char.selected;bind:updateNext, context.selected;bind:updateNext, problem.selected"></div></div></div>';
                        
                        _widget.place(_dom);
                        
                        // Method called when clicking on the accept button (changes class to "pressed")
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        // Method called when clicking next button -- updates session store, computes score and moves to next step
                        _widget.next = function(event, node){
                                spinner.spin(node.parentNode);
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                                
                                if (_next === "step"){
                                        _next = "screen"; //only one upload
                                        
                                        //update session data
                                        $data.set("characters", _cards.get("char"));
                                        $data.set("contexts", _cards.get("context"));
                                        $data.set("problems", _cards.get("problem"));
                                        
                                        // stop timer and update display
                                        clearInterval(_qsTimer);
                                        _timer.set("display", true);
                                        
                                        // compute session score
                                        _widget.updateSessionScore(_timer.get("timer"))
                                        .then(function(){
                                                // resync with db
                                                $session.unsync();
                                                return $session.sync(Config.get("db"), $session.get("_id"));
                                        })
                                        .then(function(){
                                                        // update session document
                                                        $session.set("elapsedTimers", {"quicksetup": _timer.get("timer")});
                                                        $session.set("characters", [_cards.get("char").id]);
                                                        $session.set("contexts", [_cards.get("context").id]);
                                                        $session.set("problems", [_cards.get("problem").id]);
                                                        //upload and move to next step
                                                        $next("quicksetup");         
                                        });
                                }
                                else {
                                        $next("quicksetup");
                                }
                        };
                        
                        _widget.stopSpinner = function stopSpinner(){
                                spinner.stop();
                                _widget.dom.querySelector(".next-button").classList.remove("invisible");   
                        };
                        
                        // Help popup
                        _widget.help = function(event, node){
                                Help.setContent("quicksetuphelp");
                                document.getElementById("cache").classList.add("appear");
                                document.getElementById("help-popup").classList.add("appear");
                         };
                         
                        // Method called when clicking on the previous button in the header
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quicksetup");
                        };
                        
                        // Method called to display the progress bar
                        _widget.toggleProgress = function(event, node){
                                $progress();               
                        };
                        
                        // Method called to display step timer instead of current time
                        _widget.toggleTimer = function(event,node){
                                _timer.set("display", !_timer.get("display"));        
                        };
                        
                        // Method called when clicking on the draw buttons (toggles the "pushed" class)
                        _widget.push = function(event, node){
                                if (_next !== "screen") node.classList.add("pushed");
                        };
                        
                        // Method called when releasing a draw button -- draws a card of the selected type
                        _widget.draw = function(event, node){
                                var _type = node.getAttribute("name"),
                                    _sel = _selection.get(_type);
                                    _now = new Date();
                               
                                if (_next === "step" && _ready){
                                        // if reload button -- could've used classList.contains("reload") but browser compat issue
                                        if (_sel.left === 0){
                                                // reinitialize deckStack
                                                _deckStack[_type] = $data.get("deck")[_type].concat();
                                                _sel.left = _deckStack[_type].length;
                                                _selection.set(_type, _sel);
                                        }
                                        // if a card is already selected(accepted) disable drawing
                                        if (_sel.selected){
                                                alert("please unlock selected card first");        
                                        }
                               
                                        if (_ready && !_sel.selected){
                                                _ready = false;
                                                // check if a card of this type is already selected (nothing should happen then)
                                                if (_sel.selected === false){
                                                        _widget.drawCard(_type).then(function(){
                                                                var _popup = false;
                                                                node.classList.remove("pushed");
                                                                _ready = true;
                                                                // if a popup of any type is open then reset it with the new card content
                                                                _selection.loop(function(v, i){
                                                                        if (v.popup === true){
                                                                                _popup = true;
                                                                        }        
                                                                });
                                                                if(_popup){
                                                                        _widget.setPopup(_type);
                                                                }
                                                        });        
                                                }
                                                else {
                                                        node.classList.remove("pushed");
                                                        _ready = true;
                                                }
                                        } 
                                }      
                        };
                        
                        // Method called when clicking on the accept button - toggles lock/unlock of the specific card
                        _widget.accept = function(event, node){
                                var _type = node.getAttribute("name"),
                                    _sel = _selection.get(_type); 
                                
                                if (_next === "step"){
                                        if (_cards.get(_type).id){
                                                if (_sel.selected){
                                                        // update store
                                                        _sel.selected = false;
                                                        _selection.set(_type, _sel);
                                                }
                                                else{
                                                        // update store
                                                        _sel.selected = true;
                                                        _selection.set(_type, _sel);
                                                } 
                                        }
                                        else {
                                                _sel.selected = false;
                                                _selection.set(_type, _sel);        
                                        }
                                }      
                        };
                       
                       // Method called when clicking on a card -- launches a popup                      
                        _widget.zoom = function(event, node){
                                var type = node.getAttribute("name");
                                _widget.setPopup(type);
                        };
                        
                        // Method called to initialize a card popup
                        _widget.setPopup = function setPopup(type){
                                var pos = {x:0, y:337}, // the position of the popup
                                    caret = "left", // the position of the caret
                                    old = _selection.get(_currentPopup) || "",
                                    sel = _selection.get(type);
                                
                                // reset previous card if any
                                if(old) {
                                        old.popup = false;
                                        _selection.set(_currentPopup, old);
                                }
                                sel.popup = true;
                                _selection.set(type, sel);
                                _currentPopup = type;
                                if (type === "char") pos.x = 382;
                                if (type === "context") {pos.x=102; caret="right";}
                                if (type === "problem") {pos.x=249; caret="right";}
                                
                                // only display popup if a card is present
                                if (_currentCards[type].getNbItems()){
                                        _popupUI.reset(_currentCards[type].toJSON(), pos, caret, document.getElementById("quicksetup-popup"));
                                }        
                        };
                        
                        // Method called when closing a popup -- passed as a parameter to the popup constructor
                        _widget.closePopup = function closePopup(){
                                var sel = _selection.get(_currentPopup);
                                sel.popup = false;
                                _selection.set(_currentPopup, sel);
                                _currentPopup = "";    
                        };
                        
                        // Creating the popup UI
                        _popupUI = new CardPopup(_widget.closePopup);
                        
                        // Init timer
                        _widget.initTimer = function(init){
                                var now = new Date(),
                                    _start = now.getTime(),
                                    elapsed = init || 0;
                                
                                _timer.set("display", false);
                                _timer.set("timer", elapsed);
                                // make sure current step is ongoing before restarting timer
                                if ($session.get("step") === "quicksetup"){
                                        _qsTimer = setInterval(function(){
                                                var now = new Date();
                                                _timer.set("timer", elapsed + now.getTime()-_start);
                                        }, 1000);
                                }
                        };
                        
                        // Initializing the QuickSetup UI
                        _widget.reset = function reset(sip){
                                _next = "step";
                                if (sip){
                                        // check if time has been spent on this step already
                                        _elapsed = $session.get("elapsedTimers").quicksetup || 0;
                                        
                                        if ($session.get("characters").length){
                                                _next = "screen"; // read-only
                                                // reset selection & popup status
                                                _selection.reset({
                                                        char : {selected: true, left: 1, popup: false},
                                                        context : {selected: true, left: 1, popup: false},
                                                        problem : {selected: true, left: 1, popup: false}
                                                });
                                                _currentPopup = "";
                                        
                                                // set timer and display
                                                _timer.set("timer", _elapsed);
                                                _timer.set("display", true);
                                                
                                                // retrieve session deck
                                                _widget.getDeck($session.get("deck"))
                                                .then(function(){
                                                        // retrieve card information
                                                        return _widget.getCard($session.get("characters")[0], _currentCards.char);
                                                })
                                                .then(function(){
                                                        var c = _currentCards.char;
                                                        _cards.set("char", {id:c.get("_id"),title:c.get("title"), pic:c.get("picture_file")});
                                                        $data.set("characters", _cards.get("char"));
                                                        return _widget.getCard($session.get("contexts")[0], _currentCards.context);
                                                })
                                                .then(function(){
                                                        var c = _currentCards.context;
                                                        _cards.set("context", {id:c.get("_id"),title:c.get("title"), pic:c.get("picture_file")});
                                                        $data.set("contexts", _cards.get("context"));
                                                        return _widget.getCard($session.get("problems")[0], _currentCards.problem);
                                                })
                                                .then(function(){
                                                        var c = _currentCards.problem;
                                                        _cards.set("problem", {id:c.get("_id"),title:c.get("title"), pic:c.get("picture_file")});
                                                        $data.set("problems", _cards.get("problem"));
                                                });      
                                        }
                                        else{
                                                _widget.init();
                                                // init timer
                                                _widget.initTimer(_elapsed);       
                                        }
                                }
                                else{
                                        _widget.init();
                                }
                                     
                        };
                        
                        // Method  called to retrieve the active deck from the database in the appropriate language
                        _widget.getDeck = function getDeck($deck){
                                var promise = new Promise(),
                                    cdb = new CouchDBDocument();
                                
                                cdb.setTransport(_transport);
                                cdb.sync(_db, $deck).then(function(){
                                        var result, deck = {}, lang=Config.get("user").get("lang");
                                        // check deck default language -- if it does not match user language look for a translation
                                        if (!cdb.get("default_lang") || (cdb.get("default_lang") === lang)) {
                                                result = JSON.parse(cdb.toJSON());
                                        }
                                        else {
                                                (cdb.get('translations') && cdb.get("translations")[lang]) ? result = cdb.get("translations")[lang] : result = JSON.parse(cdb.toJSON());
                                        }
                                        deck.char = result.content.characters;
                                        deck.context = result.content.contexts;
                                        deck.problem = result.content.problems;
                                        deck.techno = result.content.techno; // even though it is not for this step so there is only one request to read the deck going out to the database
                                        ["char", "context", "problem", "techno"].forEach(function(type){
                                                if (deck[type][0] === "newcard") deck[type].shift();        
                                        });
                                        $data.set("deck", deck);
                                        promise.fulfill();
                                        setTimeout(function(){cdb.unsync();}, 2000);
                                });
                                return promise;                       
                        };
                        
                        // Method called to retrieve a card information from the database
                        _widget.getCard = function getCard(id, store){
                                var promise = new Promise(),
                                    cdb = new CouchDBDocument();
                                
                                cdb.setTransport(_transport);
                                cdb.sync(_db, id).then(function(){
                                        // update currentCards
                                        store.reset(JSON.parse(cdb.toJSON()));
                                        promise.fulfill();
                                        cdb.unsync();
                                });
                                return promise;        
                        };
                        
                        
                        // Method called to draw a random card from a deckstack
                        _widget.drawCard = function drawCard(type){
                                var promise = new Promise(),
                                    sel = _selection.get(type),
                                    card = _cards.get(type),
                                    idx = Math.floor(Math.random()*_deckStack[type].length),
                                    id = _deckStack[type][idx];
                                    
                                    // get selected card
                                    _widget.getCard(id, _currentCards[type]).then(function(){
                                            var store = _currentCards[type];
                                            // increment number of cards drawn
                                            _drawnCards[type]++;
                                            // remove card from stack
                                            _deckStack[type].splice(idx, 1);
                                            // update card
                                            card.id = id;
                                            card.title = store.get("title");
                                            card.pic = store.get("picture_file");
                                            _cards.set(type, card);
                                            // update selection
                                            sel.left = _deckStack[type].length;
                                            _selection.set(type, sel);
                                            // fulfill promise
                                            promise.fulfill();
                                    });
                                    
                                    return promise;
                        };
                        
                        // Method called to update the session score at the end of the current step
                        _widget.updateSessionScore = function updateSessionScore(time){
                                var promise = new Promise(),
                                    json = {
                                        "sid": $session.get("_id"),
                                        "step": "quicksetup",
                                        "time": time,
                                        "cards": _drawnCards.char + _drawnCards.context + _drawnCards.problem
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
                        
                        // initialize quicksetup step
                        _widget.init = function init(){
                                
                                // retrieve active deck
                                _widget.getDeck(Config.get("user").get("active_deck")).then(function(){
                                        var _deck = $data.get("deck");
                                        // reset draw status
                                        _deckStack.char = _deck.char.concat();
                                        _deckStack.context = _deck.context.concat();
                                        _deckStack.problem = _deck.problem.concat();
                                        _drawnCards.char = 0; _drawnCards.context = 0; _drawnCards.problem = 0;
                                        _currentCards = {"char": new Store(), "context": new Store(), "problem": new Store()};
                                        _currentPopup = "";
                                        _ready = true;
                                        // reset timer
                                        _start = null;
                                        // reset cards
                                        _cards.reset({
                                                 char : {id:"",title:_labels.get("char"), pic: ""},
                                                context : {id:"",title:_labels.get("context"), pic: ""},
                                                problem : {id:"",title:_labels.get("problem"), pic: ""}
                                        });
                                        // reset selection
                                        _selection.reset({"char" : {selected: false, left: null, popup: false},
                                                          "context" : {selected: false, left: null, popup: false},
                                                          "problem" : {selected: false, left: null, popup: false}
                                        });
                                });        
                        };
                       
                       // Return
                        return _widget;
                };     
        });
