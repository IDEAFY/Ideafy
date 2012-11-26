define("Ideafy/Brainstorm/QuickTech", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Ideafy/Help", "Store", "CouchDBStore", "Promise", "Ideafy/CardPopup"],
        function(Widget, Map, Model, Event, Config, Help, Store, CouchDBStore, Promise, CardPopup){
                
                return function QuickTechConstructor($session, $data, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _start = null, //timer
                            _elapsed = null, //time already elapsed in this step
                            _transport = Config.get("transport"),
                            _user = Config.get("user"),
                            _labels = Config.get("labels"),
                            _popupUI, _currentPopup,
                            _techDisplay = new Store({
                                "scenario":{"popup": false},
                                "tech1":{"popup": false, "selected": false},
                                "tech2":{"popup": false, "selected":false},
                                "tech3":{"popup": false, "selected": false}
                            }),
                            _techs = [],
                            _ready = true,
                            _tech1 = new Store(),
                            _tech2 = new Store(),
                            _tech3 = new Store(),
                            _draw = {"tech1":_tech1, "tech2":_tech2, "tech3":_tech3},
                            _drawnCards = 0,
                            _techCards = new Store(), // {id, title, pic})
                            _next = "step"; // used to prevent multiple clicks/uploads on next button --> toggles "step"/"screen"
                            
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "display": new Model(_techDisplay,{
                                        updateNext : function(selected){
                                                (_techDisplay.get("tech1").selected && _techDisplay.get("tech2").selected && _techDisplay.get("tech3").selected) ? this.classList.remove("invisible"):this.classList.add("invisible");
                                        },
                                        setSelected : function(selected){
                                                (selected) ? this.classList.add("pushed") : this.classList.remove("pushed");        
                                        },
                                        popup : function(pop){
                                                (pop) ? this.classList.add("highlighted") : this.classList.remove("highlighted");
                                        }
                                }),
                                "techcards": new Model(_techCards,{
                                        removeDefault : function(pic){
                                                (pic) ? this.classList.remove("defaultcard") : this.classList.add("defaultcard");                
                                        },
                                        formatTitle : function(title){
                                                if (title) {
                                                        this.innerHTML = title.toUpperCase(); 
                                                        }       
                                        },
                                        setPic : function(pic){
                                                if (pic){
                                                        this.setAttribute("style", "background-image:url('"+pic+"');");
                                                }
                                                else {
                                                        this.setAttribute("style", "background-image: none;")
                                                }
                                        }
                                }),
                                "quicktechevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quicktech"><div class="previousbutton" data-quicktechevent="listen: touchstart, press; listen: touchstart, prev"></div><div id="quicktech-popup" class="invisible"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quicktech" data-quicktechevent="listen:touchstart, toggleProgress"></div><div class="help-brainstorm" data-quicktechevent="listen:touchstart, help"></div><div id="quicktech-left" class="leftarea"><div class="card defaultscenario" name="scenario" data-quicktechevent="listen: touchstart, select; listen:touchstart, zoom" data-display="bind: popup, scenario.popup"><div class="cardpicture"></div><div class="cardtitle" data-labels="bind:innerHTML, scenariolbl"></div></div></div><div class="drawarea"><div class="decks"><div class="drawbutton drawtech" "name"="tech" data-quicktechevent="listen: touchstart, push; listen:touchend, draw"></div></div><div class="cards"><div class="card tech defaultcard" name="tech1" data-quicktechevent="listen: touchstart, select; listen:touchend, zoom" data-techcards="bind:removeDefault, tech1.pic" data-display="bind: popup, tech1.popup"><div class="cardpicture" data-techcards="bind:setPic, tech1.pic"></div><div class="cardtitle" data-techcards="bind:formatTitle, tech1.title" data-labels="bind:innerHTML, tech1lbl"></div></div><div class="card tech defaultcard" name="tech2" data-quicktechevent="listen: touchstart, select; listen:touchend, zoom" data-techcards="bind:removeDefault, tech2.pic" data-display="bind: popup, tech2.popup"><div class="cardpicture" data-techcards="bind:setPic, tech2.pic"></div><div class="cardtitle" data-techcards="bind:formatTitle, tech2.title" data-labels="bind:innerHTML,tech2lbl">Techno 2</div></div><div class="card tech defaultcard" name="tech3" data-quicktechevent="listen: touchstart, select; listen:touchend, zoom" data-techcards="bind:removeDefault, tech3.pic" data-display="bind: popup, tech3.popup"><div class="cardpicture" data-techcards="bind:setPic, tech3.pic"></div><div class="cardtitle" data-techcards="bind:formatTitle, tech3.title" data-labels="bind:innerHTML, tech3lbl">Techno 3</div></div></div><div class="confirm"><div class="drawok" name="tech1" data-quicktechevent="listen: touchstart, push; listen:touchend, accept"></div><div class="drawok" name="tech2" data-quicktechevent="listen: touchstart, push; listen:touchend, accept"></div><div class="drawok" name="tech3" data-quicktechevent="listen: touchstart, push; listen:touchend, accept"></div></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quicktechevent="listen: touchstart, press; listen:touchend, next" data-display="bind:updateNext, tech1.selected;bind:updateNext, tech2.selected;bind:updateNext, tech3.selected"></div></div></div>';
                        
                        _widget.place(Map.get("quicktech"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed"); 
                        };
                        
                        _widget.next = function(event, node){
                                var _now = new Date(), _elapsedTime = _now.getTime() - _start;
                                
                                if (_next === "step"){
                                        _next = "screen"; //only one upload
                                        
                                        //update session data
                                        $data.set("techno", _techCards);
                                        
                                        // compute session score
                                        _widget.updateSessionScore(_elapsedTime).then(function(){
                                                // resync with db
                                                $session.unsync();
                                                $session.sync(Config.get("db"), $session.get("_id")).then(function(){
                                                        // update session document
                                                        $session.set("elapsedTimers", {"quicktech": _elapsedTime});
                                                        $session.set("techno", [[_techCards.get("tech1").id, _techCards.get("tech2").id, _techCards.get("tech3").id]]);
                                                        //upload and move to next step
                                                        node.classList.remove("pressed");
                                                        $next("quicktech");         
                                                });      
                                        });
                                }
                                else {
                                        node.classList.remove("pressed");
                                        $next("quicktech");
                                }
                        };
                        
                        // Help popup
                        _widget.help = function(event, node){
                                Help.setContent("quicktechhelp");
                                document.getElementById("cache").classList.add("appear");
                                document.getElementById("help-popup").classList.add("appear");
                         };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quicktech");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress(node);               
                        };
                        
                        _widget.select = function(event, node){
                                var name = node.getAttribute("name");
                                // do not hightlight if there is no card yet unless step is already completed
                                if (name.search("tech")<0 || _drawnCards>0 || _next === "screen") node.classList.add("highlighted")       
                        };
                        
                        _widget.zoom = function(event, node){
                                var type = node.getAttribute("name");
                                if (name.search("tech")<0 || _drawnCards>0 || _next === "screen") _widget.setPopup(type);       
                        };
                        
                        // Method called to initialize a card popup
                        _widget.setPopup = function setPopup(type){
                                var pos = {x:0, y:337}, // the position of the popup
                                    caret = "left", // the position of the caret
                                    old = _techDisplay.get(_currentPopup) || "",
                                    story = new Store(),
                                    details,
                                    sel = _techDisplay.get(type);
                                
                                // reset previous card if any
                                if(old) {
                                        old.popup = false;
                                        _techDisplay.set(_currentPopup, old);
                                }
                                sel.popup = true;
                                _techDisplay.set(type, sel);
                                _currentPopup = type;
                                if (type === "scenario") {
                                        pos.x = 240;
                                        pos.y= 275;
                                        story.reset($session.get("scenario")[0]);
                                        story.set("type", 5);
                                        details = story.toJSON();
                                }
                                else{
                                        if (type === "tech1") { pos.x=560;}
                                        if (type === "tech2") { pos.x=279; caret="right";}
                                        if (type === "tech3") { pos.x=426; caret="right";}
                                        if (_draw[type].get("_id")) details = _draw[type].toJSON();
                                }
                                // only display popup if a card is present
                                if (details){
                                        _popupUI.reset(details, pos, caret, document.getElementById("quicktech-popup"));
                                }        
                        };
                        
                        _widget.closePopup = function closePopup(){
                                var sel = _techDisplay.get(_currentPopup);
                                sel.popup = false;
                                _techDisplay.set(_currentPopup, sel);
                                _currentPopup = "";    
                        };
                        
                        _widget.push = function(event, node){
                                var name = node.getAttribute("name");
                                if (node.classList.contains("drawok")){
                                        if (_draw[name].get("_id") && _next === "step") node.classList.add("pushed")     
                                }
                                else node.classList.add("pushed")
                        };
                        
                        _widget.draw = function(event, node){
                                if (_next === "step" && _ready){
                                        _ready = false; // to prevent fast clicks
                                        if (!_techDisplay.get("tech1").selected) _widget.drawTech("tech1");
                                        if (!_techDisplay.get("tech2").selected) _widget.drawTech("tech2");
                                        if (!_techDisplay.get("tech3").selected) _widget.drawTech("tech3");
                                        
                                        setTimeout(function(){
                                                node.classList.remove("pushed");
                                                _ready = true;
                                        }, 350);
                                 }
                        };
                        
                        _widget.drawTech = function drawTech(name){
                                var idx;
                                // if no cards left in stack reset it
                                if (_techs.length === 0){
                                        _techs = $data.get("deck").techno.concat();
                                        // remove cards already selected 
                                        _techDisplay.loop(function(v,k){
                                                if (v.selected) _techs.splice(_techs.indexOf(_techCards.get(k).id), 1);
                                        });
                                }
                                
                                idx = Math.floor(Math.random()*_techs.length);
                                _widget.getCardDetails(_techs[idx], name);
                                _techs.splice(idx, 1);
                                _drawnCards++;
                        };
                        
                        _widget.getCardDetails = function getCardDetails(id, name){
                                var cdb = new CouchDBStore();
                                
                                cdb.setTransport(_transport);
                                cdb.sync(Config.get("db"), id).then(function(){
                                        _draw[name].reset(JSON.parse(cdb.toJSON()));
                                        _techCards.set(name, {"id":id, "title": cdb.get("title"), "pic": cdb.get("picture_file")});
                                        cdb.unsync();       
                                });  
                        };
                        
                        _widget.accept = function(event, node){
                                var name = node.getAttribute('name'),
                                    display = _techDisplay.get(name);
                                
                                if (_next === "step"){
                                        if (_techCards.get(name) && _techCards.get(name).id){
                                                if (display.selected){
                                                        node.classList.remove("pushed");
                                                        display.selected = false;
                                                        _techDisplay.set(name, display);        
                                                }
                                                else {
                                                        display.selected = true;
                                                        _techDisplay.set(name, display);
                                                }   
                                        }
                                        else{
                                                alert("please draw a card first");
                                                node.classList.remove("pushed");        
                                        }
                                }        
                        };
                        
                        _widget.reset = function(sip){
                                
                                var sessionTech = $session.get("techno")[0];
                                
                                //reset display
                                _techDisplay.reset({
                                        "scenario":{"popup": false},
                                        "tech1":{"popup": false, "selected": false},
                                        "tech2":{"popup": false, "selected":false},
                                        "tech3":{"popup": false, "selected": false}
                                });
                                
                                if (sip && sessionTech.length){
                                        _next = "screen"; // read-only
                                        // retrieve card information from _sessionData
                                        _widget.getCardDetails(sessionTech[0], "tech1");
                                        _widget.getCardDetails(sessionTech[1], "tech2");
                                        _widget.getCardDetails(sessionTech[2], "tech3");
                                        $data.set("techno", _techCards);
                                }
                                else{
                                        // reset techstack
                                        _techs = [];
                                        _drawnCards =0;
                                        _next = "step";
                                        _tech1.reset(); _tech2.reset(); _tech3.reset();
                                        _techCards.reset();
                                }
                        };
                        
                        // Method called to update the session score at the end of the current step
                        _widget.updateSessionScore = function updateSessionScore(time){
                                var promise = new Promise(),
                                    json = {
                                        "sid": $session.get("_id"),
                                        "step": "quicktech",
                                        "time": time,
                                        "cards": _drawnCards
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
                        
                        _widget.initTimer = function(param){
                                var now = new Date();
                                _start = now.getTime();
                                (param) ? _elapsed = param : _elapsed = 0;
                        };

                        // Creating the popup UI
                        _popupUI = new CardPopup(_widget.closePopup);
                        
                        // Retrieve deck information as soon as it becomes available                        
                        $data.watchValue("deck", function(value){
                                _techs = value.techno.concat();
                                _left = _techs.length;        
                        });
                        
                        // Return
                        return _widget;
                };     
        });
