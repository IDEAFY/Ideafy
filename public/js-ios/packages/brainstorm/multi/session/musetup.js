/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/map", "Bind.plugin", "Place.plugin", "Event.plugin", "service/config", "CouchDBDocument", "Store", "Promise", "service/cardpopup", "service/help", "service/utils", "lib/spin.min", "./mubchat"],
        function(Widget, Map, Model, Place, Event, Config, CouchDBDocument, Store, Promise, CardPopup, Help, Utils, Spinner, Chat){
                
                return function MUSetupConstructor($session, $data, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _popupUI, chatUI = new Chat(),
                            _labels = Config.get("labels"),
                            _transport = Config.get("transport"), _db = Config.get("db"), _user = Config.get("user"),
                            _deckStack = {}, // the cards remaining in the stack after each draw
                            _timer = new Store({"timer":null, "display":false}),
                            _msTimer,
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
                            spinner = new Spinner({color:"#657B99", lines:10, length: 8, width: 4, radius:8, top: 337, left: 490}).spin(),
                            spinnerOk = {};
                            // deduct 20px from position shown in navigator
                            
                        // Setup
                        _widget.seam.addAll({
                                "labels" : new Model(_labels),
                                "musetup" : new Model(_selection, {
                                        setReload : function(left){
                                                (left === 0) ? this.classList.add("reload") : this.classList.remove("reload");
                                        },
                                        updateNext : function(selected){
                                                (_next === "step" && _selection.get("char").selected && _selection.get("context").selected && _selection.get("problem").selected && _user.get("_id") === $session.get("initiator").id) ? this.classList.remove("invisible"):this.classList.add("invisible");
                                        },
                                        popup : function(pop){
                                                (pop) ? this.classList.add("highlighted") : this.classList.remove("highlighted");
                                        },
                                        setSelected : function(selected){
                                                (selected)?this.classList.add("pushed"):this.classList.remove("pushed");
                                        }
                                }),
                                "musetuptimer" : new Model(_timer, {
                                      setTime: function(timer){
                                                      if (timer){
                                                              this.innerHTML = Utils.formatDuration(timer);
                                                       }      
                                      },
                                      displayTimer: function(display){
                                              (display) ? this.classList.add("showtimer") : this.classList.remove("showtimer");
                                      }
                                }),
                                "musetupcards" : new Model(_cards,{
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
                                "place" : new Place({"chat": chatUI}),
                                "musetupevent": new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "musetup"><div class="previousbutton" data-musetupevent="listen: touchstart, press; listen: touchstart, prev"></div><div id="musetup-popup" class="invisible"></div><div class="brainstorm-header header blue-dark" data-labels="bind: innerHTML, musetup" data-musetupevent="listen:touchstart, toggleProgress"></div><div class="timer" data-musetuptimer="bind:setTime, timer; bind: displayTimer, display" data-musetupevent="listen:touchstart,toggleTimer"></div><div class="help-brainstorm" data-musetupevent="listen:touchstart, help"></div><div class="drawarea"><div class="decks"><div class="drawbutton drawchar" name="char" data-musetupevent="listen: touchstart, push; listen:touchend, draw" data-musetup="bind: setReload, char.left"></div><div class="drawbutton drawcontext" name="context" data-musetupevent="listen: touchstart, push; listen:touchend, draw" data-musetup="bind:setReload, context.left"></div><div class="drawbutton drawproblem" name="problem" data-musetupevent="listen: touchstart, push; listen:touchend, draw" data-musetup="bind:setReload, problem.left"></div></div><div class="cards"><div class="card char defaultcard" name="char" data-musetupevent="listen:touchstart, zoom" data-musetupcards="bind:removeDefault, char.pic" data-musetup="bind: popup, char.popup"><div class="cardpicture" data-musetupcards="bind: setPic, char.pic"></div><div class="cardtitle" data-musetupcards="bind:formatTitle, char.title">Character</div></div><div class="card context defaultcard" name="context" data-musetupevent="listen:touchstart, zoom" data-musetupcards="bind:removeDefault, context.pic" data-musetup="bind: popup, context.popup"><div class="cardpicture" data-musetupcards="bind: setPic, context.pic"></div><div class="cardtitle" data-musetupcards="bind:formatTitle, context.title">Context</div></div><div class="card problem defaultcard" name="problem" data-musetupevent="listen:touchstart, zoom" data-musetupcards="bind:removeDefault, problem.pic" data-musetup="bind: popup, problem.popup"><div class="cardpicture" data-musetupcards="bind: setPic, problem.pic"></div><div class="cardtitle" data-musetupcards="bind:formatTitle, problem.title">Problem</div></div></div><div class="confirmdraw"><div class="drawok" name="char" data-musetup="bind:setSelected, char.selected" data-musetupevent="listen: touchstart, pushOk; listen:touchend, accept"></div><div class="drawok" name="context" data-musetup="bind:setSelected, context.selected" data-musetupevent="listen: touchstart, pushOk; listen:touchend, accept"></div><div class="drawok" name="problem" data-musetup="bind:setSelected, problem.selected" data-musetupevent="listen: touchstart, pushOk; listen:touchend, accept"></div></div><div class="next-button invisible" data-labels="bind:innerHTML, nextbutton" data-musetupevent="listen: touchstart, press; listen:touchend, next" data-musetup="bind:updateNext, char.selected;bind:updateNext, context.selected;bind:updateNext, problem.selected"></div></div><div class="sessionchat" data-place="place:chat"></div></div>';
                        
                        // Method called when clicking on the accept button (changes class to "pressed")
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        // Method called when clicking next button -- updates session store, computes score and moves to next step
                        _widget.next = function(event, node){
                                spinner.spin(node.parentNode);
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                                
                                // only the session leader can push next
                                if (_next === "step"){
                                        _next = "screen"; //only one upload
                                        //update session data
                                        $data.set("characters", _cards.get("char"));
                                        $data.set("contexts", _cards.get("context"));
                                        $data.set("problems", _cards.get("problem"));
                                        
                                        // stop timer and update display
                                        clearInterval(_msTimer);
                                        _timer.set("display", true);
                                        
                                        // compute session score -- score change triggers move to the next step
                                        _widget.updateSessionScore(_timer.get("timer"))
                                        .then(function(){
                                               // resync with db
                                                $session.unsync();
                                                return $session.sync(Config.get("db"), $session.get("_id"))
                                        })
                                        .then(function(){
                                                // notify participants via chat
                                                chatUI.conclude("next");
                                                // update session document
                                                $session.set("elapsedTimers", {"musetup": _timer.get("timer")});
                                                $session.set("characters", [_cards.get("char").id]);
                                                $session.set("contexts", [_cards.get("context").id]);
                                                $session.set("problems", [_cards.get("problem").id]);
                                                //upload and move to next step
                                                $next("musetup");         
                                        });
                                }
                                else {
                                        $next("musetup");
                                }
                        };
                        
                        _widget.stopSpinner = function stopSpinner(){
                                spinner.stop();
                        };
                        
                        // Help popup
                        _widget.help = function(event, node){
                                Help.setContent("musetuphelp");
                                document.getElementById("cache").classList.add("appear");
                                document.getElementById("help-popup").classList.add("appear");
                         };
                         
                        // Method called when clicking on the previous button in the header
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("musetup");
                        };
                        
                        // Method called to display the progress bar
                        _widget.toggleProgress = function(event, node){
                                $progress();               
                        };
                        
                        // Method called to display step timer instead of current time
                        _widget.toggleTimer = function(event,node){
                                if ($session.get("initiator").id === _user.get("_id")){
                                        _timer.set("display", !_timer.get("display")); 
                                }       
                        };
                        
                        // Method called when clicking on the draw buttons (toggles the "pushed" class)
                        _widget.push = function(event, node){
                                if (_next !== "screen" && _user.get("_id") === $session.get("initiator").id) node.classList.add("pushed");
                        };
                        
                        // Method called when releasing a draw button -- draws a card of the selected type
                        _widget.draw = function(event, node){
                                var _type = node.getAttribute("name"),
                                    _sel = _selection.get(_type);
                                    _now = new Date();
                               
                                if (_user.get("_id") === $session.get("initiator").id && _next === "step" && _ready){
                                        _ready = false;
                                        // if reload button -- could've used classList.contains("reload") but browser compat issue
                                        if (_sel.left === 0){
                                                // reinitialize deckStack
                                                _deckStack[_type] = $data.get("deck")[_type].concat();
                                                _sel.left = _deckStack[_type].length;
                                                _selection.set(_type, _sel);
                                        }
                                        // if a card is already selected(accepted) disable drawing
                                        if (_sel.selected){
                                                _ready = true; 
                                                alert("please unlock selected card first");
                                        }
                                        else {
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
                        
                        // Method called when clicking on the accept buttton
                        _widget.pushOk = function(event, node){
                                var spok = spinnerOk[node.getAttribute("name")] || null;
                                if (_user.get("_id") === $session.get("initiator").id && _next === "step"){
                                        if (!spok) {
                                                spinnerOk[node.getAttribute("name")] = new Spinner().spin(node);
                                        }
                                        else{
                                                spinnerOk[node.getAttribute("name")].spin(node);
                                        }
                                }        
                        };
                        
                        // Method called when clicking on the accept button - toggles lock/unlock of the specific card
                        _widget.accept = function(event, node){
                                var _type = node.getAttribute("name"),
                                    _sel = _selection.get(_type); 
                                
                                if (_next === "step" && $session.get("initiator").id === _user.get("_id")){
                                        if (_cards.get(_type).id){
                                                _sel.selected = !_sel.selected; 
                                        }
                                        else {
                                                _sel.selected = false;        
                                        }
                                        // make sure session is up-to-date by resyncing
                                        $session.unsync();
                                        $session.sync(Config.get("db"), $session.get("_id"))
                                        .then(function(){
                                                $session.set("selected_"+_type, _sel.selected);
                                                return $session.upload();
                                        })
                                        .then(function(){
                                                spinnerOk[node.getAttribute("name")].stop();
                                                selection.set(_type, _sel);
                                        }); 
                                }      
                        };
                       
                       // Method called when clicking on a card -- launches a popup                      
                        _widget.zoom = function(event, node){
                                var type = node.getAttribute("name");
                                _widget.setPopup(type);
                        };
                        
                        // Method called to initialize a card popup
                        _widget.setPopup = function setPopup(type){
                                var pos = {x:0, y:257}, // the position of the popup
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
                                        _popupUI.reset(_currentCards[type].toJSON(), pos, caret, document.getElementById("musetup-popup"));
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
                        
                        // Getting the chat UI
                        _widget.getChatUI = function getChatUI(){
                                return chatUI;        
                        };
                        
                        // Init timer
                        _widget.initTimer = function(init){
                                var now = new Date(),
                                    _start = now.getTime(),
                                    elapsed = init || 0;
                                
                                _timer.set("timer", elapsed);
                                // make sure current step is ongoing before restarting timer
                                if ($session.get("step") === "musetup"){
                                        clearInterval(_msTimer);
                                        _msTimer = setInterval(function(){
                                                var now = new Date();
                                                _timer.set("timer", elapsed + now.getTime()-_start);
                                        }, 1000);
                                }
                        };
                        
                        // Initializing the musetup UI
                        _widget.reset = function reset(replay){
                                
                               // retrieve chat document
                               chatUI.clear();
                                if ($session.get("chat")[1]){
                                        chatUI.reset($session.get("chat")[1]);
                                }
                                if (replay){
                                        _next = "screen"; // read-only
                                        
                                        // expand chat read area in to cover write interface in case of replay
                                        chatUI.dom.querySelector(".chatread").classList.add("extended");
                                        
                                        // check if time has been spent on this step already
                                        _elapsed = $session.get("elapsedTimers").musetup || 0;
                                        
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
                                        
                                        if ($session.get("characters").length){
                                                // retrieve session deck
                                                _widget.getDeck($session.get("deck")).then(function(){
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
                                }
                                else{
                                        _widget.init();
                                }
                                     
                        };
                        
                        // Method  called to retrieve the active deck from the database in the appropriate language
                        _widget.getDeck = function getDeck(deckId){
                                var promise = new Promise(),
                                    cdb = new CouchDBDocument();
                                
                                cdb.setTransport(_transport);
                                cdb.sync(_db, deckId).then(function(){
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
                                        cdb.unsync();
                                });
                                return promise;                       
                        };
                        
                        // Method called to retrieve a card information from the database
                        _widget.getCard = function getCard(id, store){
                                var promise = new Promise,
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
                                    idx = Math.floor(Math.random()*_deckStack[type].length),
                                    id = _deckStack[type][idx];
                                
                                $session.set("drawn_"+type, id);
                                $session.upload().then(function(){
                                        // increment number of cards drawn
                                        _drawnCards[type]++;
                                        // remove card from stack
                                        _deckStack[type].splice(idx, 1);
                                        promise.fulfill();       
                                });
                                return promise;
                        };
                        
                        _widget.updateDrawnCard = function updateDrawnCard(type, id){
                                var sel, card,
                                    promise = new Promise();
                                
                                // get selected card
                                if (type && id){
                                        sel = _selection.get(type);
                                        card = _cards.get(type);
                                        _widget.getCard(id, _currentCards[type]).then(function(){
                                                var store = _currentCards[type];
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
                                }
                                return promise;
                        };
                        
                        // Method called to update the session score at the end of the current step
                        _widget.updateSessionScore = function updateSessionScore(time){
                                var promise = new Promise(),
                                    json = {
                                        "sid": $session.get("_id"),
                                        "step": "musetup",
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
                        
                        
                        // initialize musetup step
                        _widget.init = function init(){
                                
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
                                
                                _drawnCards.char = 0; _drawnCards.context = 0; _drawnCards.problem = 0;
                                _currentCards = {"char": new Store(), "context": new Store(), "problem": new Store()};
                                _currentPopup = "";
                                
                                // if user is session leader
                                if (_user.get("_id") === $session.get("initiator").id){
                                        _widget.getDeck($session.get("deck")).then(function(){
                                                var _deck = $data.get("deck");
                                                // reset draw status
                                                _deckStack.char = _deck.char.concat();
                                                _deckStack.context = _deck.context.concat();
                                                _deckStack.problem = _deck.problem.concat();
                                                _ready = true;
                                                _widget.initTimer();
                                        });        
                                }
                                else {_timer.set("display", false);}
                                
                                _next = "step";        
                        };
                        
                        $session.watchValue("drawn_char", function(val){
                                val && _widget.updateDrawnCard("char", val);       
                        });
                        
                        $session.watchValue("drawn_context", function(val){
                                val && _widget.updateDrawnCard("context", val);       
                        });
                        
                        $session.watchValue("drawn_problem", function(val){
                                val && _widget.updateDrawnCard("problem", val);       
                        });
                        
                        $session.watchValue("selected_char", function(val){
                                var selChar;
                                selChar = _selection.get("char");
                                selChar.selected = val;
                                _selection.set("char", selChar);
                                if (val){
                                        // update session data store (used in further steps)
                                        $data.set("characters", _cards.get("char"));
                                }       
                        });
                        
                        $session.watchValue("selected_context", function(val){
                                var selCtx;
                                selCtx = _selection.get("context");
                                selCtx.selected = val;
                                _selection.set("context", selCtx);
                                if (val){
                                        $data.set("contexts", _cards.get("context"));
                                }       
                        });
                        
                        $session.watchValue("selected_problem", function(val){
                                var selPb;
                                selPb= _selection.get("problem");
                                selPb.selected = val;
                                _selection.set("problem", selPb);
                                if (val){
                                        $data.set("problems", _cards.get("problem"));
                                }     
                        });
                        
                        // display timer once the step is complete
                        $session.watchValue("elapsedTimers", function(value){
                                if (value.musetup) {
                                        _timer.set("timer", value.musetup);
                                        _timer.set("display", true);
                                }        
                        });
                        
                        // Return
                        return _widget;
                };     
        });
