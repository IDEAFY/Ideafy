define("Ideafy/Brainstorm/QuickB", ["Olives/OObject", "Map", "Amy/Stack-plugin", "Olives/Model-plugin", "Olives/Event-plugin", "Ideafy/Brainstorm/QuickStart", "Ideafy/Brainstorm/QuickSetup", "Ideafy/Brainstorm/QuickScenario", "Ideafy/Brainstorm/QuickTech", "Ideafy/Brainstorm/QuickIdea", "Ideafy/Brainstorm/QuickWrapup", "CouchDBStore", "Config", "Promise", "Store"],
        function(Widget, Map, Stack, Model, Event, QuickStart, QuickSetup, QuickScenario, QuickTech, QuickIdea, QuickWrapup, CouchDBStore, Config, Promise, Store){
                
           return function QuickBConstructor($sip){
                   
                   // declaration
                   var _widget = new Widget(),
                       _progress = new Widget(),
                       _frag = document.createDocumentFragment(),
                       _dom = Map.get("ideafy-quick"),
                       _stack = new Stack(),
                       _labels = Config.get("labels"),
                       _steps = new Store([
                               {name: "quickstart", label: _labels.get("quickstepstart"), currentStep: true, status:"ongoing"},
                               {name: "quicksetup", label: _labels.get("quickstepsetup"), currentStep: false, status:null},
                               {name: "quickscenario", label: _labels.get("quickstepscenario"), currentStep: false, status:null},
                               {name: "quicktech", label: _labels.get("quicksteptech"), currentStep: false, status:null},
                               {name: "quickidea", label: _labels.get("quickstepidea"), currentStep: false, status:null},
                               {name: "quickwrapup", label: _labels.get("quickstepwrapup"), currentStep: false, status:null}
                               ]),
                       _session = new CouchDBStore();
                       
                   
                   // setup -- initialize UIs (progress bar and stack) and _session couchdbstore
                   _session.setTransport(Config.get("transport"));
                   
                   _progress.plugins.addAll({
                           "labels" : new Model(_labels),
                           "step" : new Model(_steps, {
                                   setCurrent : function(currentStep){
                                           (currentStep) ? this.classList.add("pressed") : this.classList.remove("pressed");
                                   },
                                   setActive : function(status){
                                           console.log(status);
                                           (status) ? this.classList.remove("inactive") : this.classList.add("inactive");
                                   }
                           }),
                           "progressevent" : new Event(_progress)
                   });
                   _progress.template = '<div class = "progressbar"><ul id = "quicksteplist" class="steplist" data-step="foreach"><li class="step inactive" data-step="bind: innerHTML, label; bind:setCurrent, currentStep; bind:setActive, status" data-progressevent="listen: click, changeStep"></li></ul></div>';
                   _progress.place(_frag);
                   
                   _widget.plugins.add("quickstack", _stack);
                   _widget.alive(_dom);
                   
                   // UI methods
                   
                   _progress.changeStep = function(event, node){
                        var _id = node.getAttribute("data-step_id");
                        // only change if new step status is not null
                        if (_steps.get(_id).status){
                                _steps.loop(function(v,i){
                                        (_id == i) ? _steps.update(i, "currentStep", true) : _steps.update(i, "currentStep", false);
                                });
                                _stack.getStack().show(_steps.get(_id).name);
                                //_widget.toggleProgress(node);
                        }
                        else {
                                event.stopImmediatePropagation();
                        }              
                   };
                   
                   _widget.retrieveSession = function retrieveSession(sip){       
                   };
                   
                   _widget.startNewSession = function startNewSession(){
                           
                   };
                   
                   _widget.reset = function reset(sip){
                        (sip) ?  _widget.retrieveSession(sip) : _widget.startNewSession();     
                   };
                   
                   _widget.prev = function prev(currentName){
                        var _id;
                        _steps.loop(function(value, idx){
                                if (value.name === currentName){
                                        _id = idx;
                                }
                        });
                        if (_id>0) {
                                _steps.update(_id, "currentStep", false);
                                _steps.update(_id-1, "currentStep", true);
                                _stack.getStack().show(_steps.get(_id-1).name);
                        }             
                   };
                   
                   _widget.next = function next(currentName){
                        var _id;
                        _steps.loop(function(value, idx){
                                if (value.name === currentName){
                                        _id = idx;
                                }
                        });
                        if (_id < _steps.getNbItems()-1) {
                                _steps.update(_id, "status", "done");
                                _steps.update(_id, "currentStep", false);
                                _steps.update(_id+1, "status", "ongoing");
                                _steps.update(_id+1, "currentStep", true);
                                _stack.getStack().show(_steps.get(_id+1).name);
                        }        
                   };
                   
                   _widget.init = function init(){
                           _stack.getStack().add("quickstart", new QuickStart(_session, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("quicksetup", new QuickSetup(_session, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("quickscenario", new QuickScenario(_session, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("quicktech", new QuickTech(_session, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("quickidea", new QuickIdea(_session, _widget.prev, _widget.next, _widget.toggleProgress));
                           _stack.getStack().add("quickwrapup", new QuickWrapup(_session, _widget.prev, _widget.next, _widget.toggleProgress));
                           QUICKSTACK = _stack;
                           _stack.getStack().show("quickstart");
                   };
                   
                   _widget.toggleProgress = function toggleProgress(node){
                           var _progressBar = node.querySelector(".progressbar");
                           
                           if (_progressBar) {
                                   node.removeChild(_progressBar);
                                   _progress.place(_frag);
                           }
                           else node.appendChild(_frag);        
                   };
                   
                   // init
                   _widget.init();
                   _widget.reset($sip);
                   WID = _widget;
                   STEPS = _steps;
                   
                   // return
                   return _widget;
           };    
        });
