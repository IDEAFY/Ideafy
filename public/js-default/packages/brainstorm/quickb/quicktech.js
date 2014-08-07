/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      emily = require("../../../libs/emily"),
      CouchDBTools = require("../../../libs/CouchDBTools"),
      Widget = olives.OObject,
      Map = require("../../../services/map"),
      Config = require("../../../services/config"),
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      CardPopup = require("../../../services/cardpopup"),
      Help = require("../../../services/help"),
      Store = emily.Store,
      CouchDBDocument = CouchDBTools.CouchDBDocument,
      Promise = emily.Promise,
      Utils = require("../../../services/utils"),
      Spinner = require("../../../libs/spin.min");

module.exports = function QuickTechConstructor($session, $data, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _start = null, //timer
                            _elapsed = null, //time already elapsed in this step
                            _qtTimer,
                            _timer = new Store({"timer":null, "display":false}),
                            _transport = Config.get("transport"),
                            _user = Config.get("user"),
                            _labels = Config.get("labels"),
                            _popupUI, _currentPopup,
                            _displayInit = {
                                "left": "",
                                "scenario":{"popup": false},
                                "tech1":{"popup": false, "selected": false},
                                "tech2":{"popup": false, "selected":false},
                                "tech3":{"popup": false, "selected": false}
                            },
                            _techDisplay = new Store(_displayInit),
                            _techs = [],
                            _ready = true,
                            _tech1 = new Store(),
                            _tech2 = new Store(),
                            _tech3 = new Store(),
                            _draw = {"tech1":_tech1, "tech2":_tech2, "tech3":_tech3},
                            _drawnCards = 0,
                            _techCards = new Store([
                                    {"id":"", "title":"", "pic":""},
                                    {"id":"", "title":"", "pic":""},
                                    {"id":"", "title":"", "pic":""}
                            ]), // {id, title, pic}) -- there are always 3 tech cards in quick mode
                            _next = "step", // used to prevent multiple clicks/uploads on next button --> toggles "step"/"screen"
                            spinner  = new Spinner({color:"#657B99", lines:10, length: 8, width: 4, radius:8, top: 373, left:373}).spin();
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "display": new Model(_techDisplay,{
                                        setReload : function(left){
                                                (!left && _drawnCards>0) ? this.classList.add("reload") : this.classList.remove("reload");
                                        },
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
                                                else this.innerHTML = _labels.get(this.parentNode.getAttribute("name")+"lbl");      
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
                                                        this.setAttribute("style", "background-image: none;");
                                                }
                                        }
                                }),
                                "quicktechtimer" : new Model(_timer, {
                                      setTime: function(timer){
                                                      this.innerHTML = Utils.formatDuration(timer);       
                                      },
                                      displayTimer: function(display){
                                              (display) ? this.classList.add("showtimer") : this.classList.remove("showtimer");
                                      }
                                }),
                                "quicktechevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quicktech"><div class="previousbutton" data-quicktechevent="listen: mousedown, press; listen: mousedown, prev"></div><div id="quicktech-popup" class="invisible"></div><div class="brainstorm-header header blue-dark" data-labels="bind: innerHTML, quicktech" data-quicktechevent="listen:mousedown, toggleProgress"></div><div class="timer" data-quicktechtimer="bind:setTime, timer; bind: displayTimer, display" data-quicktechevent="listen:mousedown,toggleTimer"></div><div class="help-brainstorm" data-quicktechevent="listen:mousedown, help"></div><div id="quicktech-left" class="leftarea"><div class="card defaultscenario" name="scenario" data-quicktechevent="listen: mousedown, select; listen:mousedown, zoom" data-display="bind: popup, scenario.popup"><div class="cardpicture"></div><div class="cardtitle" data-labels="bind:innerHTML, scenariolbl"></div></div></div><div class="drawarea"><div class="decks"><div class="drawbutton drawtech" "name"="tech" data-quicktechevent="listen: mousedown, push; listen:mouseup, draw" data-display="bind: setReload, left"></div></div><div class="cards"><div class="card tech defaultcard" name="tech1" data-quicktechevent="listen: mousedown, select; listen:mouseup, zoom" data-techcards="bind:removeDefault, 0.pic" data-display="bind: popup, tech1.popup"><div class="cardpicture" data-techcards="bind:setPic, 0.pic"></div><div class="cardtitle" data-techcards="bind:formatTitle, 0.title" data-labels="bind:innerHTML, tech1lbl"></div></div><div class="card tech defaultcard" name="tech2" data-quicktechevent="listen: mousedown, select; listen:mouseup, zoom" data-techcards="bind:removeDefault, 1.pic" data-display="bind: popup, tech2.popup"><div class="cardpicture" data-techcards="bind:setPic, 1.pic"></div><div class="cardtitle" data-techcards="bind:formatTitle, 1.title" data-labels="bind:innerHTML,tech2lbl"></div></div><div class="card tech defaultcard" name="tech3" data-quicktechevent="listen: mousedown, select; listen:mouseup, zoom" data-techcards="bind:removeDefault, 2.pic" data-display="bind: popup, tech3.popup"><div class="cardpicture" data-techcards="bind:setPic, 2.pic"></div><div class="cardtitle" data-techcards="bind:formatTitle, 2.title" data-labels="bind:innerHTML, tech3lbl"></div></div></div><div class="confirmdraw"><div class="drawok" name="tech1" data-display="bind:setSelected, tech1.selected" data-quicktechevent="listen: mousedown,  accept"></div><div class="drawok" name="tech2" data-display="bind:setSelected, tech2.selected" data-quicktechevent="listen: mousedown, accept"></div><div class="drawok" name="tech3" data-display="bind:setSelected, tech3.selected" data-quicktechevent="listen: mousedown, accept"></div></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quicktechevent="listen: mousedown, press; listen:mouseup, next" data-display="bind:updateNext, tech1.selected;bind:updateNext, tech2.selected;bind:updateNext, tech3.selected"></div></div></div>';
                        
                        _widget.place(Map.get("quicktech"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed"); 
                        };
                        
                        _widget.next = function(event, node){
                                var _now = new Date(), _elapsedTime = _now.getTime() - _start;
                                
                                spinner.spin(node.parentNode);
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                                
                                if (_next === "step"){
                                        _next = "screen"; //only one upload
                                        
                                        //update session data
                                        $data.set("techno", _techCards);
                                        
                                        // stop timer and update display
                                        clearInterval(_qtTimer);
                                        _timer.set("display", true);
                                        
                                        // compute session score
                                        _widget.updateSessionScore(_timer.get("timer"))
                                        .then(function(){
                                               // resync with db
                                                $session.unsync();
                                                return $session.sync(Config.get("db"), $session.get("_id"));
                                        })
                                        .then(function(){
                                                var timers = $session.get("elapsedTimers");
                                                        
                                                timers.quicktech = _timer.get("timer");
                                                        
                                                // update session document
                                                $session.set("elapsedTimers", timers);
                                                $session.set("techno", [[_techCards.get(0).id, _techCards.get(1).id, _techCards.get(2).id]]);
                                                
                                                //upload and move to next step
                                                $next("quicktech");         
                                        });
                                }
                                else {
                                        $next("quicktech");
                                }
                        };
                        
                        _widget.stopSpinner = function stopSpinner(){
                                spinner.stop();
                                _widget.dom.querySelector(".next-button").classList.remove("invisible");   
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
                                $progress();               
                        };
                        
                        // toggle timer
                        _widget.toggleTimer = function(event,node){
                                _timer.set("display", !_timer.get("display"));        
                        };
                        
                        _widget.select = function(event, node){
                                var name = node.getAttribute("name");
                                // do not hightlight if there is no card yet unless step is already completed
                                
                                if (name.search("tech")<0 || _drawnCards>0 || _next === "screen") 
                                        {
                                                node.classList.add("highlighted");
                                        }     
                        };
                        
                        _widget.zoom = function(event, node){
                                var type = node.getAttribute("name");
                                if (type.search("tech")<0 || _drawnCards>0 || _next === "screen") {
                                        _widget.setPopup(type);
                                } 
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
                                        pos.x = 147;
                                        pos.y= 275;
                                        story.reset($session.get("scenario")[0]);
                                        story.set("type", 5);
                                        details = story.toJSON();
                                }
                                else{
                                        if (type === "tech1") { pos.x=467;}
                                        if (type === "tech2") { pos.x=186; caret="right";}
                                        if (type === "tech3") { pos.x=333; caret="right";}
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
                                        if (_draw[name].get("_id") && _next === "step") node.classList.add("pushed");
                                }
                                else node.classList.add("pushed");
                        };
                        
                        _widget.draw = function(event, node){
                                var toDraw = [];
                                
                                if (_next === "step" && _ready){
                                        _ready = false; // to prevent fast clicks
                                        
                                        // check which cards are needed
                                        ["tech1", "tech2", "tech3"].forEach(function(tech){
                                                if (!_techDisplay.get(tech).selected) {
                                                        toDraw.push(tech);
                                                }
                                        });
                                        
                                        _widget.drawTech(toDraw)
                                        .then(function(){
                                                node.classList.remove("pushed");
                                                _ready = true;        
                                        });
                                 }
                        };
                        
                        _widget.drawTech = function drawTech(arr){
                                var idx, accepted = [], promise = new Promise();
                                
                                arr.forEach(function(name){
                                        // if no cards left in tech stack, reload stack and eliminate already drawn cards
                                        if (_techs.length <= 0){
                                                _techs = $data.get("deck").techno.concat();
                                                // remove selected cards from deck
                                                ["tech1", "tech2", "tech3"].forEach(function(tech, idx){
                                                        if (_techDisplay.get(tech).selected) {accepted.push(_techCards.get(idx).id);}        
                                                });
                                                _techs.filter(function(value){
                                                        return !(accepted.indexOf(value)>-1);
                                                });        
                                        }
                                        // draw card, increment drawncards and get card details
                                        idx = Math.floor(Math.random()*_techs.length);
                                        _widget.getCardDetails(_techs[idx], name);
                                        _techDisplay.set("left", _techs.length);
                                        _drawnCards++;
                                        _techs.splice(idx, 1); 
                                });
                                promise.fulfill();
                                return promise;
                        };
                        
                        _widget.getCardDetails = function getCardDetails(id, name){
                                var cdb = new CouchDBDocument(), idx = ["tech1", "tech2", "tech3"].indexOf(name), promise = new Promise();
                                
                                cdb.setTransport(_transport);
                                cdb.sync(Config.get("db"), id).then(function(){
                                        _draw[name].reset(JSON.parse(cdb.toJSON()));
                                        _techCards.update(idx,"id",id);
                                        _techCards.update(idx,"title",cdb.get("title"));
                                        _techCards.update(idx,"pic", cdb.get("picture_file"));
                                        promise.fulfill();
                                        cdb.unsync();      
                                });
                                return promise; 
                        };
                        
                        _widget.accept = function(event, node){
                                var name = node.getAttribute('name'),
                                    idx = ["tech1", "tech2", "tech3"].indexOf(name),
                                    display = _techDisplay.get(name);
                                
                                if (_next === "step"){
                                        if (_techCards.get(idx).id){
                                        display.selected = !display.selected;
                                                _techDisplay.set(name, display);
                                        }
                                        else{
                                                alert("please draw a card first"); // replace with a label
                                        }
                                }        
                        };
                        
                        _widget.reset = function(sip){
                                
                                var sessionTech = $session.get("techno")[0];
                                //reset display
                                _techDisplay.reset({
                                        "left": "",
                                        "scenario":{"popup": false},
                                        "tech1":{"popup": false, "selected": false},
                                        "tech2":{"popup": false, "selected":false},
                                        "tech3":{"popup": false, "selected": false}
                                });
                                
                                _techCards.reset([
                                                {"id":"", "title":"", "pic":""},
                                                {"id":"", "title":"", "pic":""},
                                                {"id":"", "title":"", "pic":""}
                                        ]);
                                _next = "step";
                                
                                // check if session is in progress and if techs have been defined already
                                if (sip && sessionTech && sessionTech.length){
                                        _next = "screen"; // read-only
                                        // retrieve card information from session data
                                        _widget.getCardDetails(sessionTech[0], "tech1")
                                        .then(function(){
                                                return _widget.getCardDetails(sessionTech[1], "tech2");
                                        })
                                        .then(function(){
                                                return _widget.getCardDetails(sessionTech[2], "tech3");
                                        })
                                        .then(function(){
                                                ["tech1", "tech2", "tech3"].forEach(function(value){
                                                        _techDisplay.set(value, {"popup": false, "selected": true});
                                                });
                                                $data.set("techno", _techCards);  
                                        });
                                }
                                else{
                                        // reset techstack
                                        _techs = [];
                                        _drawnCards =0;
                                        _tech1.reset(); _tech2.reset(); _tech3.reset();
                                        _techCards.reset([
                                                {"id":"", "title":"", "pic":""},
                                                {"id":"", "title":"", "pic":""},
                                                {"id":"", "title":"", "pic":""}
                                        ]);
                                }
                                
                                // retrieve time already spent on this step and init/display timer as appropriate
                                ($session.get("elapsedTimers").quicktech) ? _elapsed = $session.get("elapsedTimers").quicktech : _elapsed = 0;
                                _timer.set("timer", _elapsed);
                                (_next === "screen")?_timer.set("display", true):_widget.initTimer(_elapsed);
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
                                                promise.fulfill();
                                        }
                                        else {
                                                promise.reject();
                                        }
                                });
                                return promise;
                        };
                        
                        _widget.initTimer = function(init){
                                var now = new Date(),
                                    _start = now.getTime(),
                                    elapsed = init || 0;
                                
                                _timer.set("display", false);
                                _timer.set("timer", elapsed);
                                // make sure current step is ongoing before restarting timer
                                if ($session.get("step") === "quicktech"){
                                        _qtTimer = setInterval(function(){
                                                var now = new Date();
                                                _timer.set("timer", elapsed + now.getTime()-_start);
                                        }, 1000);
                                }          
                         };

                        // Creating the popup UI
                        _popupUI = new CardPopup(_widget.closePopup);
                        
                        // Retrieve deck information as soon as it becomes available                        
                        $data.watchValue("deck", function(value){
                                _techs = value.techno.concat();
                                _techDisplay.set("left", _techs.length);      
                        });
                        
                        // Return
                        return _widget;
};