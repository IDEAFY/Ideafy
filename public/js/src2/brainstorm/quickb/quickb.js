define("Ideafy/Brainstorm/QuickB", ["Olives/OObject", "Map", "Amy/Stack-plugin", "Ideafy/Brainstorm/QuickStart", "Ideafy/Brainstorm/QuickSetup", "Ideafy/Brainstorm/QuickScenario", "Ideafy/Brainstorm/QuickTech", "Ideafy/Brainstorm/QuickIdea", "Ideafy/Brainstorm/QuickWrapup", "CouchDBStore", "Config", "Promise"],
        function(Widget, Map, Stack, QuickStart, QuickSetup, QuickScenario, QuickTech, QuickIdea, QuickWrapup, CouchDBStore, Config, Promise){
                
           return function QuickBConstructor($sip){
                   
                   // declaration
                   var _widget = new Widget(),
                       _stack = new Stack(),
                       _steps = ["quickstart", "quicksetup", "quickscenario", "quicktech", "quickidea", "quickwrapup"],
                       _session = new CouchDBStore();
                       
                   
                   // setup
                   console.log($sip);
                   _session.setTransport(Config.get("transport"));
                   _widget.plugins.add("quickstack", _stack);
                   
                   _widget.alive(Map.get("ideafy-quick"));
                   
                   _widget.retrieveSession = function retrieveSession(sip){
                        console.log(sip);        
                   };
                   
                   _widget.startNewSession = function startNewSession(){
                           
                   };
                   
                   _widget.reset = function reset(sip){
                        (sip) ?  _widget.retrieveSession(sip) : _widget.startNewSession();     
                   };
                   
                   _widget.prev = function prev(currentName){
                        var id = _steps.indexOf(currentName);
                        if (id>0) _stack.getStack().show(_steps[i-1]);             
                   };
                   
                   _widget.next = function next(currentName){
                        var id = _steps.indexOf(currentName);
                        if (id < _steps.length-1) _stack.getStack().show(_steps[id+1]);        
                   };
                   
                   _widget.init = function init(){
                           _stack.getStack().add("quickstart", new QuickStart(_session, _widget.prev, _widget.next));
                           _stack.getStack().add("quicksetup", new QuickSetup(_session, _widget.prev, _widget.next));
                           _stack.getStack().add("quickscenario", new QuickScenario(_session, _widget.prev, _widget.next));
                           _stack.getStack().add("quicktech", new QuickTech(_session, _widget.prev, _widget.next));
                           _stack.getStack().add("quickidea", new QuickIdea(_session, _widget.prev, _widget.next));
                           _stack.getStack().add("quickwrapup", new QuickWrapup(_session, _widget.prev, _widget.next));
                           QUICKSTACK = _stack;
                           _stack.getStack().show("quickstart");
                   };
                   
                   // init
                   _widget.init();
                   _widget.reset($sip);
                   
                   // return
                   return _widget;
           };    
        });
