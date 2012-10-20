define("Ideafy/Brainstorm/QuickSetup", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "CouchDBStore", "Store", "Promise", "Ideafy/CardPopup"],
        function(Widget, Map, Model, Event, Config, CouchDBStore, Store, Promise, CardPopup){
                
                return function QuickSetupConstructor($session, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _popupUI,
                            _dom = Map.get("quicksetup"),
                            _labels = Config.get("labels"),
                            _transport = Config.get("transport"), _db = Config.get("db"), _user = Config.get("user"),
                            _deck = {}, // to store the initial deck content
                            _deckStack = {}, // the cards remaining in the stack after each draw
                            _selection = new Store({
                                     char : {id:"",title:"", pic: "", selected: false, left: null, popup: false},
                                     context : {id:"",title:"", pic: "", selected: false, left: null, popup: false},
                                     problem : {id:"",title:"", pic: "", selected: false, left: null, popup: false}
                                     }),
                            _drawnCards = {"char": 0, "context": 0, "problem" : 0},
                            _ready = true, // ready to draw a new card 
                            _currentCards = {"char": new Store(), "context": new Store(), "problem": new Store()}, // used for zoom
                            _currentPopup = "", // which card if any is magnified
                            _start =  null;
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "quicksetup" : new Model(_selection, {
                                        removeDefault : function(pic){
                                                (pic) ? this.classList.remove("defaultcard") : this.classList.add("defaultcard");                
                                        },
                                        setReload : function(left){
                                                (!left) ? this.classList.add("reload") : this.classList.remove("reload");
                                        },
                                        formatTitle : function(title){
                                                if (title) {
                                                        this.innerHTML = title.substring(0,1).toUpperCase()+title.substring(1).toLowerCase(); 
                                                        }       
                                        },
                                        setPic : function(pic){
                                                if (pic){
                                                        this.setAttribute("style", "background-image:url('"+pic+"');");
                                                }
                                                else {
                                                        this.setAttribute("style", "background-image: none;")
                                                }
                                        },
                                        updateNext : function(selected){
                                                (_selection.get("char").selected && _selection.get("context").selected && _selection.get("problem").selected) ? this.classList.remove("invisible"):this.classList.add("invisible");
                                        },
                                        popup : function(pop){
                                                (pop) ? this.classList.add("highlighted") : this.classList.remove("highlighted");
                                        }
                                }),
                                "quicksetupevent": new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quicksetup"><div class="previousbutton" data-quicksetupevent="listen: touchstart, press; listen: touchstart, prev"></div><div id="quicksetup-popup" class="invisible"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quicksetup" data-quicksetupevent="listen:touchstart, toggleProgress"></div><div class="drawarea"><div class="decks"><div class="drawbutton drawchar" name="char" data-quicksetupevent="listen: touchstart, push; listen:touchend, draw" data-quicksetup="bind: setReload, char.left"></div><div class="drawbutton drawcontext" name="context" data-quicksetupevent="listen: touchstart, push; listen:touchend, draw" data-quicksetup="bind:setReload, context.left"></div><div class="drawbutton drawproblem" name="problem" data-quicksetupevent="listen: touchstart, push; listen:touchend, draw" data-quicksetup="bind:setReload, problem.left"></div></div><div class="cards"><div class="card char defaultcard" name="char" data-quicksetupevent="listen:touchstart, zoom" data-quicksetup="bind:removeDefault, char.pic; bind: popup, char.popup"><div class="cardpicture" data-quicksetup="bind: setPic, char.pic"></div><div class="cardtitle" data-quicksetup="bind:formatTitle, char.title">Character</div></div><div class="card context defaultcard" name="context" data-quicksetupevent="listen:touchstart, zoom" data-quicksetup="bind:removeDefault, context.pic;bind: popup, context.popup"><div class="cardpicture" data-quicksetup="bind: setPic, context.pic"></div><div class="cardtitle" data-quicksetup="bind:formatTitle, context.title">Context</div></div><div class="card problem defaultcard" name="problem" data-quicksetupevent="listen:touchstart, zoom" data-quicksetup="bind:removeDefault, problem.pic; bind: popup, problem.popup"><div class="cardpicture" data-quicksetup="bind: setPic, problem.pic"></div><div class="cardtitle" data-quicksetup="bind:formatTitle, problem.title">Problem</div></div></div><div class="confirm"><div class="drawok" name="char" data-quicksetupevent="listen: touchstart, push; listen:touchend, accept"></div><div class="drawok" name="context" data-quicksetupevent="listen: touchstart, push; listen:touchend, accept"></div><div class="drawok" name="problem" data-quicksetupevent="listen: touchstart, push; listen:touchend, accept"></div></div><div class="next-button invisible" data-labels="bind:innerHTML, nextbutton" data-quicksetupevent="listen: touchstart, press; listen:touchend, next" data-quicksetup="bind:updateNext, char.selected;bind:updateNext, context.selected;bind:updateNext, problem.selected"></div></div></div>';
                        
                        _widget.alive(_dom);
                        
                        // Method called when clicking on the accept button (changes class to "pressed")
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        // Method called when clicking next button -- updates session store, computes score and moves to next step
                        _widget.next = function(event, node){
                                var _now = new Date(), _elapsedTime = _now.getTime() - _start;
                                
                                // compute session score
                                _widget.updateSessionScore(_elapsedTime).then(function(){
                                        // update session document
                                        var sid = $session.get("_id");
                                        $session.unsync();
                                        $session.sync(_db, sid).then(function(){
                                                $session.set("elapsedTimers", {"quicksetup": _elapsedTime});
                                                $session.set("characters", [_selection.get("char").id]);
                                                $session.set("contexts", [_selection.get("context").id]);
                                                $session.set("problems", [_selection.get("problem").id]);
                                                $session.set("step", "quickscenario"); 
                                                //upload and move to next step
                                                $session.upload().then(function(){
                                                        node.classList.remove("pressed");
                                                        $next("quicksetup");        
                                                });        
                                        });       
                                });
                        };
                        
                        // Method called when clicking on the previous button in the header
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quicksetup");
                        };
                        
                        // Method called to display the progress bar
                        _widget.toggleProgress = function(event, node){
                                $progress(node);               
                        };
                        
                        // Method called when clicking on the draw buttons (toggles the "pushed" class)
                        _widget.push = function(event, node){
                                node.classList.add("pushed");
                        };
                        
                        // Method called when releasing a draw button -- draws a card of the selected type
                        _widget.draw = function(event, node){
                                var _type = node.getAttribute("name"),
                                    _sel = _selection.get(_type);
                                    _now = new Date();
                               
                               // if reload button -- could've used classList.contains("reload") but browser compat issue
                               if (_sel.left === 0){
                                       // reinitialize deckStack
                                       _deckStack[_type] = _deck[_type].concat();
                                       _sel.left = _deckStack[_type].length;
                                       _selection.set(_type, _sel);
                               }
                               // if a card is already selected(accepted) disable drawing
                               if (_sel.selected){
                                        alert("please unlock selected card first");        
                               }
                               
                               if (_ready && !_sel.selected){
                                        _ready = false;
                                        // init timer if this is the first card drawn
                                        if (!_start) _start = _now.getTime();
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
                        };
                        
                        // Method called when clicking on the accept button - toggles lock/unlock of the specific card
                        _widget.accept = function(event, node){
                                var _type = node.getAttribute("name"),
                                    _sel = _selection.get(_type); 
                                
                                // disable if no card is present
                                if (_selection.get(_type).id){
                                        if (_sel.selected){
                                                node.classList.remove("pushed");
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
                                        node.classList.remove("pushed");        
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
                                    sel = _selection.get(type);
                                
                                sel.popup = true;
                                _selection.set(type, sel);
                                _currentPopup = type;
                                if (type === "char") pos.x = 475;
                                if (type === "context") {pos.x=195; caret="right";}
                                if (type === "problem") {pos.x=342; caret="right";}
                                
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
                        
                        // Initializing the QuickSetup UI
                        _widget.reset = function reset(){
                                // retrieve active deck
                                _widget.getDeck().then(function(){
                                        // reset draw status
                                        _deckStack.char = _deck.char.concat();
                                        _deckStack.context = _deck.context.concat();
                                        _deckStack.problem = _deck.problem.concat();
                                        _drawnCards.char = 0; _drawnCards.context = 0; _drawnCard.problem = 0;
                                        _currentCards = {"char": new Store(), "context": new Store(), "problem": new Store()};
                                        _currentPopup = "";
                                        _ready = true;
                                        // reset timer
                                        _start = null;
                                        // reset selection
                                        _selection.reset({
                                                char : {id:"",title:"", pic: "", selected: false, left: null, popup: false},
                                                context : {id:"",title:"", pic: "", selected: false, left: null, popup: false},
                                                problem : {id:"",title:"", pic: "", selected: false, left: null, popup: false}
                                                });
                                });
                                     
                        };
                        
                        // Method  called to retrieve the active deck from the database
                        _widget.getDeck = function getDeck(){
                                var promise = new Promise,
                                    cdb = new CouchDBStore();
                                
                                cdb.setTransport(_transport);
                                cdb.sync(_db, _user.get("active_deck")).then(function(){
                                        _deck.char = cdb.get("content").characters;
                                        _deck.context = cdb.get("content").contexts;
                                        _deck.problem = cdb.get("content").problems;
                                        promise.resolve();
                                        cdb.unsync();
                                });
                                return promise;                       
                        };
                        
                        // Method called to retrieve a card information from the database
                        _widget.getCard = function getCard(id, store){
                                var promise = new Promise,
                                    cdb = new CouchDBStore();
                                
                                cdb.setTransport(_transport);
                                cdb.sync(_db, id).then(function(){
                                        // update currentCards
                                        store.reset(JSON.parse(cdb.toJSON()));
                                        promise.resolve();
                                        cdb.unsync();
                                });
                                return promise;        
                        };
                        
                        // Method called to draw a random card from a deckstack
                        _widget.drawCard = function drawCard(type){
                                var promise = new Promise(),
                                    sel = _selection.get(type),
                                    idx = Math.floor(Math.random()*_deckStack[type].length),
                                    id = _deckStack[type][idx];
                                    
                                    // get selected card
                                    _widget.getCard(id, _currentCards[type]).then(function(){
                                            var store = _currentCards[type];
                                            // increment number of cards drawn
                                            _drawnCards[type]++;
                                            // remove card from stack
                                            _deckStack[type].splice(idx, 1);
                                            // update selection
                                            sel.id = id;
                                            sel.title = store.get("title");
                                            sel.pic = store.get("picture_file");
                                            sel.left = _deckStack[type].length;
                                            _selection.set(type, sel);
                                            // resolve promise
                                            promise.resolve();
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
                                                promise.resolve();
                                        }
                                        else {
                                                promise.reject();
                                        }
                                });
                                return promise;
                        };
                        
                        // Return
                        return _widget;
                };     
        });
