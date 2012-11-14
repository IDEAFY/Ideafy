define("Ideafy/Brainstorm/QuickScenario", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store", "CouchDBStore", "Ideafy/CardPopup", "Ideafy/Whiteboard"],
        function(Widget, Map, Model, Event, Config, Store, CouchDBStore, CardPopup, Whiteboard){
                
                return function QuickScenarioConstructor($session, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _popupUI, _currentPopup,
                             _labels = Config.get("labels"),
                             _char = new Store(), _context = new Store(), _problem = new Store(),
                             _cards = new Store({
                                     "char": {"title": "", "pic": "", "popup": false},
                                     "context": {"title": "", "pic": "", "popup": false},
                                     "problem": {"title": "", "pic": "", "popup": false}
                                     }),
                             _tools = new Store({"postit": "inactive"}, {"import": "inactive"}, {"drawing": "inactive"}),
                            _wbContent = new Store([]), // a store of whiteboard objects
                            _wb = new Whiteboard("scenario", _wbContent, _tools);
                             
                        
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "cards" : new Model(_cards, {
                                        removeDefault : function(pic){
                                                (pic) ? this.classList.remove("defaultcard") : this.classList.add("defaultcard");                
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
                                        popup : function(pop){
                                                (pop) ? this.classList.add("highlighted") : this.classList.remove("highlighted");
                                        }
                                }),
                                "wbtools" : new Model(_tools, {
                                        setActive : function(status){
                                                (status === "active") ? this.classList.add("pushed") : this.classList.remove("pushed");
                                        }
                                }),
                                "wbstack" : _wb,
                                "quickscenarioevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickscenario"><div class="previousbutton" data-quickscenarioevent="listen: touchstart, press; listen: touchstart, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickscenario" data-quickscenarioevent="listen:touchstart, toggleProgress"></div><div id="quickscenario-left" class="leftarea"><div class = "card char defaultcard" data-cards="bind:removeDefault,char.pic; bind:popup,char.popup" name="char" data-quickscenarioevent="listen:touchstart, zoom"><div class="cardpicture" data-cards="bind:setPic,char.pic"></div><div class="cardtitle" data-cards="bind:formatTitle,char.title">Character</div></div><div class="card context defaultcard" name="context" data-cards="bind:removeDefault,context.pic;bind: popup,context.popup" data-quickscenarioevent="listen:touchstart, zoom"><div class="cardpicture" data-cards="bind:setPic,context.pic"></div><div class="cardtitle" data-cards="bind: formatTitle,context.title">Context</div></div><div class="card problem defaultcard" name="problem" data-cards="bind:removeDefault,problem.pic;bind:popup, problem.popup" data-quickscenarioevent="listen:touchstart, zoom"><div class="cardpicture" data-cards="bind:setPic,problem.pic"></div><div class="cardtitle" data-cards="bind:formatTitle,problem.title">Problem</div></div></div><div id="quickscenario-popup"></div><div id="quickscenario-right" class="workarea"><div id="scenario-whiteboard" class="whiteboard"><div class="stack" data-wbstack="destination"></div></div><div class="toolbox"><div class="toolbox-button"><div class="postit-button" name="postit" data-wbtools="bind:setActive, postit" data-quickscenarioevent="listen: touchstart, push; listen:touchend, post"></div><legend>Post-it</legend></div><div class="toolbox-button"><div class="importpic-button" name="import" data-wbtools="bind:setActive, import" data-quickscenarioevent="listen: touchstart, push; listen:touchend, importpic"></div><legend>Import pictures</legend></div><div class="toolbox-button"><div class="drawingtool-button" name="drawing" data-wbtools="bind:setActive, drawing" data-quickscenarioevent="listen: touchstart, push; listen:touchend, draw"></div><legend>Drawing tool</legend></div></div><div class="finish-button" data-labels="bind:innerHTML, finishbutton" data-quickscenarioevent="listen: touchstart, press; listen:touchend, finish"></div><div id = "quickscenario-writeup" class="writeup invisible"><textarea class = "enterTitle"></textarea><div class="setPrivate"></div><div class="setPublic"></div><textarea class = "enterDesc"></textarea><textarea class = "enterSol"></textarea><div class = "finish-button finish-writeup"></div></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickscenarioevent="listen: touchstart, press; listen:touchend, next"></div></div></div>';
                        
                        _widget.place(Map.get("quickscenario"));
                        
                        // function called when pressing a button (next or finish)
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                node.classList.remove("pressed");
                                $next("quickscenario");
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickscenario");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress(node);               
                        };
                        
                        // function called when selecting one of the scenario tools
                        _widget.push = function(event, node){
                                var name = node.getAttribute("name");
                                _tools.set(name,"active");
                        };
                        
                        _widget.zoom = function(event, node){
                                var type = node.getAttribute("name");
                                _widget.setPopup(type);        
                        };
                        
                        // Method called to initialize a card popup
                        _widget.setPopup = function setPopup(type){
                                var pos = {x:240, y: 130}, // the position of the popup
                                    caret = "left", // the position of the caret
                                    card = _cards.get(type),
                                    details; // the contents of the cards
                                
                                card.popup = true;
                                _cards.set(type, card);
                                _currentPopup = type;
                                if (type === "char") {
                                        pos.y = 120;
                                        details = _char.toJSON();
                                }
                                if (type === "context") {
                                        pos.y = 290;
                                        details = _context.toJSON();
                                }
                                if (type === "problem") {
                                        pos.y = 350;
                                        details = _problem.toJSON();
                                }
                                
                                // only display popup if a card is present
                                if (details){
                                        _popupUI.reset(details, pos, caret, document.getElementById("quickscenario-popup"));
                                }        
                        };
                        
                        // Method called when closing a popup -- passed as a parameter to the popup constructor
                        _widget.closePopup = function closePopup(){
                                var card = _cards.get(_currentPopup);
                                card.popup = false;
                                _cards.set(_currentPopup, card);
                                _currentPopup = "";    
                        };
                        
                        // Creating the popup UI
                        _popupUI = new CardPopup(_widget.closePopup);
                        
                        _widget.post = function(event, node){
                                _wb.selectScreen("postit");
                                _tools.set("import", "inactive");
                                _tools.set("drawing", "inactive");        
                        };
                        
                        _widget.importpic = function(event, node){
                                _wb.selectScreen("import");
                                _tools.set("postit", "inactive");
                                _tools.set("drawing", "inactive");
                        };
                        
                        _widget.draw = function(event, node){
                                _wb.selectScreen("drawing");
                                _tools.set("import", "inactive");
                                _tools.set("postit", "inactive");
                        };
                        
                        _widget.exitTool = function exitTool(name){
                                _tools.set(name, "inactive");
                        };
                        
                        _widget.finish = function(event, node){
                                
                        };
                        
                        // init interface
                        // Initializing the QuickScenario UI
                        _widget.reset = function reset(){
                                // reset timer
                                _start = null;
                                                        
                                // reset whiteboard (if sip, need to show existing content)
                                _wb.setSessionId($session.get("_id"));
                                _wbContent.reset($session.get("scenarioWB"));
                                (_wbContent.getNbItems()) ? _wb.selectScreen("main") : _wb.selectScreen("default");
                                
                                // if step is finished display story else display toolbar
                         };
                        
                        // get selected cards
                        $session.watchValue("characters", function(value){
                                var cdb = new CouchDBStore();
                                    cdb.setTransport(Config.get("transport"));
                                if (value.length === 1){
                                        // in the case of a  quick brainstorm there is only one character - for multiple characters a bulk query would be used ({keys: value})
                                        cdb.sync(Config.get("db"), value[0]).then(function(){
                                                _char.reset(JSON.parse(cdb.toJSON()));
                                                _cards.set("char", {"title": _char.get("title"), "pic": _char.get("picture_file"), "popup": false});
                                                cdb.unsync();           
                                        });
                                }        
                        });
                        $session.watchValue("contexts", function(value){
                                var cdb = new CouchDBStore();
                                    cdb.setTransport(Config.get("transport"));
                                if (value.length === 1){
                                        cdb.sync(Config.get("db"), value[0]).then(function(){
                                                _context.reset(JSON.parse(cdb.toJSON()));
                                                _cards.set("context", {"title": _context.get("title"), "pic": _context.get("picture_file"), "popup": false});
                                                cdb.unsync();            
                                        });
                                }        
                        });
                        $session.watchValue("problems", function(value){
                                var cdb = new CouchDBStore();
                                    cdb.setTransport(Config.get("transport"));
                                if (value.length === 1){
                                        cdb.sync(Config.get("db"), value[0]).then(function(){
                                                _problem.reset(JSON.parse(cdb.toJSON()));
                                                _cards.set("problem", {"title": _problem.get("title"), "pic": _problem.get("picture_file"), "popup": false});
                                                cdb.unsync();           
                                        });
                                }        
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
                                });  
                        });
                        
                        // Return
                        return _widget;
                };     
        });
