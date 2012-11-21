define("Ideafy/Brainstorm/QuickStart", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Model, Event, Config){
                
                return function QuickStartConstructor($session, $prev, $next, $progress){
                        
                        // declaration
                        var _widget = new Widget(),
                            _session = $session,
                            _user = Config.get("user"),
                            _db = Config.get("db"),
                             _labels = Config.get("labels"),
                             _next = "step";
                        
                        // setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "model" : new Model(_session, {
                                        setTitle : function(initiator){
                                                var _now = new Date();
                                                if (initiator && initiator.username) this.setAttribute("placeholder", _labels.get("quickstarttitleplaceholderpre")+initiator.username+_labels.get("quickstarttitleplaceholderpost"));
                                        }
                                }),
                                "quickstartevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickstart"><div class="previousbutton" data-quickstartevent="listen: touchstart, press; listen: touchstart, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickstart" data-quickstartevent="listen:touchstart, toggleProgress"></div><form class="quickstart-form"><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="quickstart-title" autofocus="" name="title" data-model="bind:value, title; bind: setTitle, initiator"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="quickstart-desc" name="description" data-model="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickstartevent="listen: touchstart, press; listen:touchend, next"></div></form><div>';
                        
                        _widget.alive(Map.get("quickstart"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                               if (_next === "step"){
                                        _next = "screen";
                                        // if title field is empty, set placeholder value as the default title
                                        if (_session.get("title") === ""){
                                                _session.set("title", _labels.get("quickstarttitleplaceholderpre")+_session.get("initiator").username+_labels.get("quickstarttitleplaceholderpost"));      
                                        }
                                
                                        // IMPORTANT: the new session doc is created in CDB and the session document is synched for the entire session
                                        _session.set("_id", "S:"+_session.get("startTime"));
                                        _session.sync(_db, _session.get("_id"));
                                        setTimeout(function(){
                                                //_session.upload();
                                                // set session in progress in user document
                                                _user.set("sessionInProgress", {id : _session.get("_id"), type: "quick"});
                                                // next step
                                                $next("quickstart");
                                         }, 200);
                                        
                                }
                                else{
                                        node.classList.remove("pressed");
                                        $next("quickstart");        
                                }
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickstart");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress(node);               
                        };
                        
                        _widget.reset = function reset(sip){
                                var now = new Date();
                                if (sip){
                                        (_session.get("step") === "quickstart") ? _next = "step" : next = "screen";       
                                }
                                else{
                                        _session.set("startTime", now.getTime());
                                        _session.set("date", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                        _next = "step";
                                }
                        };
                        
                        // init
                        
                        // return
                        return _widget;
                };     
        });
