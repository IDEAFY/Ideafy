define("Ideafy/Brainstorm/QuickStart", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Model, Event, Config){
                
                return function QuickStartConstructor($session, $prev, $next, $progress){
                        
                        // declaration
                        var _widget = new Widget(),
                            _session = $session,
                            _user = Config.get("user"),
                            _db = Config.get("db"),
                             _labels = Config.get("labels");
                        
                        // setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "model" : new Model(_session, {
                                        setTitle : function(initiator){
                                                var _now = new Date();
                                                if (initiator && initiator.username) this.setAttribute("placeholder", initiator.username+_labels.get("quickstarttitleplaceholder")+_now.toLocaleDateString());
                                        }
                                }),
                                "quickstartevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickstart"><div class="previousbutton" data-quickstartevent="listen: touchstart, press; listen: click, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickstart" data-quickstartevent="listen:click, toggleProgress"></div><form class="quickstart-form"><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="quickstart-title" name="title" data-model="bind:value, title; bind: setTitle, initiator" data-labels="bind: placeholder, quickstarttitleplaceholder"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="quickstart-desc" name="description" data-model="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickstartevent="listen: touchstart, press; listen:click, next"></div></form><div>';
                        
                        _widget.alive(Map.get("quickstart"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                node.classList.remove("pressed");
                                
                                _session.set("step", "quicksetup");
                                // if title field is empty, set placeholder value as the default title
                                if (_session.get("title") === ""){
                                        _session.set("title", _session.get("initiator").username+_labels.get("quickstarttitleplaceholder")+new Date(_session.get("startTime")).toLocaleDateString());      
                                }
                                
                                // IMPORTANT: the new session doc is created in CDB and the session document is synched for the entire session
                                // it should only be synced once to avoid conflicts.
                                if (!_session.get("_id")) {
                                        // if no existing id this will create the doc in couchdb -- else we assume the sync has been done before.
                                        _session.sync(_db, "S:"+_session.get("startTime"));
                                }
                                // work around to avoid upload before store is actually listening for changes
                                setTimeout(function(){
                                                _session.upload().then(function(){
                                                        // ugly workaround to add session _id to _session store....
                                                        _session.unsync();
                                                        _session.sync(_db, "S:"+_session.get("startTime")).then(function(){
                                                                console.log(_session.toJSON());
                                                                $next("quickstart"); 
                                                                // set session in progress in user document
                                                                _user.set("sessionInProgress", {id : _session.get("_id"), type: "quick"});         
                                                        });       
                                                });
                                        }, 200);
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickstart");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress(node);               
                        };
                        
                        _widget.reset = function reset(){
                                var now = new Date();
                                _session.set("startTime", now.getTime());
                                _session.set("date", [now.getFullYear(), now.getMonth(), now.getDate()]);
                        };
                        
                        // init
                        
                        // return
                        return _widget;
                };     
        });
