define("Ideafy/Brainstorm/QuickTech", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Ideafy/Help", "Store", "CouchDBStore", "Promise"],
        function(Widget, Map, Model, Event, Config, Help, Store, CouchDBStore, Promise){
                
                return function QuickTechConstructor($session, $data, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _start = null, //timer
                            _elapsed = null, //time already elapsed in this step
                            _transport = Config.get("transport"),
                            _user = Config.get("user"),
                            _labels = Config.get("labels"),
                            _techs = [];
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "quicktechevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quicktech"><div class="previousbutton" data-quicktechevent="listen: touchstart, press; listen: touchstart, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quicktech" data-quicktechevent="listen:touchstart, toggleProgress"></div><div class="help-brainstorm" data-quicktechevent="listen:touchstart, help"></div><div id="quicktech-left" class="leftarea"><div class="card defaultscenario" name="scenario" data-quicktechevent="listen: touchstart, select; listen:touchstart, zoom"><div class="cardpicture"></div><div class="cardtitle">Your Story</div></div></div><div class="drawarea"><div class="decks"><div class="drawbutton drawtech" "name"="tech" data-quicktechevent="listen: touchstart, push; listen:touchend, draw"></div></div><div class="cards"><div class="card tech defaultcard" data-quicktechevent="listen: touchstart, select; listen:touchend, zoom"><div class="cardpicture"></div><div class="cardtitle">Tech 1</div></div><div class="card tech defaultcard" data-quicktechevent="listen: touchstart, select; listen:touchend, zoom"><div class="cardpicture"></div><div class="cardtitle">Tech 2</div></div><div class="card tech defaultcard" data-quicktechevent="listen: touchstart, select; listen:touchend, zoom"><div class="cardpicture"></div><div class="cardtitle">Tech 3</div></div></div><div class="confirm"><div class="drawok" name="tech1" data-quicktechevent="listen: touchstart, push; listen:touchend, accept"></div><div class="drawok" name="tech 2" data-quicksetupevent="listen: touchstart, push; listen:touchend, accept"></div><div class="drawok" name="tech 3" data-quicktechevent="listen: touchstart, push; listen:touchend, accept"></div></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quicktechevent="listen: touchstart, press; listen:touchend, next"></div></div></div>';
                        
                        _widget.alive(Map.get("quicktech"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                node.classList.remove("pressed");
                                $next("quicktech");
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
                                node.classList.add("highlighted");        
                        };
                        
                        _widget.zoom = function(event, node){
                                
                        };
                        
                        _widget.push = function(event, node){
                                node.classList.add("pushed");
                        };
                        
                        _widget.draw = function(event, node){
                                node.classList.remove("pushed");        
                        };
                        
                        _widget.accept = function(event, node){
                                node.classList.remove("pushed");         
                        };
                        
                        _widget.reset = function(sip){
                                if(sip){}
                                else{}
                        };
                        
                        // Method  called to retrieve the active deck from the database
                        _widget.getDeck = function getDeck(){
                                var promise = new Promise,
                                    cdb = new CouchDBStore();
                                
                                cdb.setTransport(_transport);
                                cdb.sync(_db, _user.get("active_deck")).then(function(){
                                        _techs = cdb.get("content").techno;
                                        promise.resolve();
                                        cdb.unsync();
                                });
                                return promise;                       
                        };
                        
                        _widget.initTimer = function(param){
                                var now = new Date();
                                _start = now.getTime();
                                (param) ? _elapsed = param : _elapsed = 0;
                        };
                        // Return
                        return _widget;
                };     
        });
