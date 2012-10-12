define("Ideafy/Brainstorm/QuickWrapup", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Model, Event, Config){
                
                return function QuickWrapupConstructor($session, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                             _labels = Config.get("labels");
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "quickwrapupevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickwrapup"><div class="previousbutton" data-quickwrapupevent="listen: touchstart, press; listen: click, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickwrapup" data-quickwrapupevent="listen:click, toggleProgress"></div><div class="congrats"><div class="message"><span class="messagetitle">Congratulations !</span><span class="sessioncompleted">You successfully completed your Ideafy session</span></div><div class="enddeedee"></div></div><div class="summary"><div class="storysummary"><div class="storyheader">Your Story</div><div class="storytitle">Title :</div><div class="storycontent"><p class="summaryheader">Scenario</p><p class="content">scenario content</p><p class="summaryheader">Solution</p><p class="content">solution content</p></div></div><div class="ideasummary"><div class="ideaheader">Your Idea</div><div class="ideatitle">Title :</div><div class="ideacontent"><p class="summaryheader">Idea description</p><p class="content">non technical description</p><p class="summaryheader">Technical solution</p><p class="content">solution content</p></div></div></div><div class="sessionresults"><div class ="sessiontime"><span>Your Time</span><span>9 min 32 sec</span></div><div class="sessionscore"><span>Your Score</span><span>500ip</span></div></div><div class="sessioncards"><legend>Cards used during this session</legend><div class="cardlist"></div></div></div>';
                        
                        _widget.alive(Map.get("quickwrapup"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                node.classList.remove("pressed");
                                $next("quickwrapup");
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickwrapup");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress(node);               
                        };
                        
                        // Return
                        return _widget;
                };     
        });
