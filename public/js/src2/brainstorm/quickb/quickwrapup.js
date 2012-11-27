define("Ideafy/Brainstorm/QuickWrapup", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store", "Ideafy/Utils"],
        function(Widget, Map, Model, Event, Config, Store, Utils){
                
                return function QuickWrapupConstructor($session, $data, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _wrapup = new Store(),
                             _labels = Config.get("labels");
                        
                        // Setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "wrapup" : new Model(_wrapup, {
                                        formatTitle : function(title){
                                                if (title) {
                                                        this.innerHTML = title.substring(0,1).toUpperCase()+title.substring(1).toLowerCase(); 
                                                        }       
                                        },
                                        setScore : function(score){
                                                if (score) this.innerHTML = score + "ip";
                                        },
                                        setTime : function(duration){
                                                if (duration) this.innerHTML = Utils.formatDuration(duration);
                                        }
                                }),
                                "quickwrapupevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "quickwrapup"><div class="previousbutton" data-quickwrapupevent="listen: touchstart, press; listen: touchstart, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickwrapup" data-quickwrapupevent="listen:touchstart, toggleProgress"></div><div class="congrats"><div class="message"><span class="messagetitle" data-labels="bind:innerHTML, congratulations"></span><span class="sessioncompleted" data-labels="bind:innerHTML, sessioncompleted"></span></div><div class="enddeedee"></div></div><div class="summary"><div class="storysummary"><div class="storyheader" data-labels="bind:innerHTML, storytitlelbl">Your Story</div><div class="storytitle" data-wrapup="bind:formatTitle, scenario.title"></div><div class="storycontent"><p class="summaryheader" data-labels="bind:innerHTML, scenarioheader"></p><p class="content" data-wrapup="bind:innerHTML, scenario.story"></p><p class="summaryheader" data-labels="bind:innerHTML, scenariosolution"></p><p class="content" data-wrapup="bind:innerHTML, scenario.solution">solution content</p></div></div><div class="ideasummary"><div class="ideaheader" data-labels="bind:innerHTML, ideatitlelbl"></div><div class="ideatitle" data-wrapup="bind:formatTitle, idea.title"></div><div class="ideacontent"><p class="summaryheader" data-labels="bind:innerHTML, ideadescription"></p><p class="content" data-wrapup="bind:innerHTML, idea.description"></p><p class="summaryheader" data-labels="bind:innerHTML, ideaimplementation"></p><p class="content" data-wrapup="bind:innerHTML, idea.solution">solution content</p></div></div></div><div class="sessionresults"><div class ="sessiontime"><span data-labels="bind:innerHTML, yourtime"></span><span data-wrapup = "bind: formatDuration, duration"></span></div><div class="sessionscore"><span data-labels="bind:innerHTML, yourscore"></span><span data-wrapup="bind:setScore, score"></span></div></div><div class="sessioncards"><legend>Cards used during this session</legend><div class="cardlist"></div></div></div>';
                        
                        _widget.place(Map.get("quickwrapup"));
                        
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
                        
                        _widget.reset = function reset(sip){
                                console.log(sip, $session.toJSON());        
                        };
                        
                        // watch session data for updates
                        $data.watchValue("scenario", function(value){
                                _wrapup.set("scenario", value);        
                        });
                        
                        $data.watchValue("idea", function(value){
                                _wrapup.set("idea", value);
                        });
                        
                        // watch session store for score update
                        $session.watchValue("score", function(score){
                                _wrapup.set("score", score);        
                        });
                        
                        $session.watchValue("duration", function(duration){
                                _wrapup.set("duration", duration);     
                        });
                        
                        // Return
                        return _widget;
                };     
        });
