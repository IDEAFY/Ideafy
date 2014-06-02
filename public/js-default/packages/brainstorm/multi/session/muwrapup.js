/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */
define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "Place.plugin", "service/config", "Store", "service/utils", "./mubchat"],
        function(Widget, Map, Model, Event, Place, Config, Store, Utils, Chat){
                
                return function MUWrapupConstructor($session, $data, $prev, $next, $progress){
                        
                        // Declaration
                        var _widget = new Widget(),
                            _wrapup = new Store(),
                            _cards = new Store([]),
                            _labels = Config.get("labels"),
                            chatUI = new Chat(),
                            _flash;
                        
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
                                                if (score) this.innerHTML = score + " ip";
                                        },
                                        setTime : function(duration){
                                                if (duration) this.innerHTML = Utils.formatDuration(duration);
                                        },
                                        alertMsg : function(newmsg){
                                                var node = this;
                                                if (newmsg && _widget.dom.querySelector(".sessionchat").classList.contains("folded")){
                                                        _flash = setInterval(function(){
                                                                node.classList.toggle("flashing");        
                                                        }, 300);
                                                }
                                                else{
                                                        _flash && clearInterval(_flash);
                                                }
                                        },
                                        setVisibility : function(visibility){
                                                (visibility && visibility === "public") ? this.classList.add("publicwrapup") : this.classList.remove("publicwrapup");
                                        },
                                        setReplay : function(replay){
                                                (replay) ? this.classList.remove("invisible") : this.classList.add("invisible");        
                                        }
                                        
                                }),
                                "cards" : new Model(_cards, {
                                        formatTitle : function(title){
                                                var id = this.getAttribute("data-cards_id");
                                                if (title){
                                                        if (id < 3) {
                                                                this.innerHTML = title.substring(0,1).toUpperCase()+title.substring(1).toLowerCase(); 
                                                        }
                                                        else{
                                                                this.innerHTML = title.toUpperCase();
                                                                this.setAttribute("style", "font-family:Helvetica;");
                                                        }
                                               }    
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
                                "place" : new Place({"chat": chatUI}),
                                "muwrapupevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "muwrapup"><div class="previousbutton" data-muwrapupevent="listen: mousedown, press; listen: mousedown, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, muwrapup" data-muwrapupevent="listen:mousedown, toggleProgress"></div><div class="congrats"><div class="message"><span class="messagetitle" data-labels="bind:innerHTML, congratulations"></span><span class="sessioncompleted" data-labels="bind:innerHTML, sessioncompleted"></span></div><div class="enddeedee"></div></div><div class="summary"><div class="storysummary"><div class="storyheader" data-labels="bind:innerHTML, storytitlelbl">Your Story</div><div class="storytitle" data-wrapup="bind:formatTitle, scenario.title"></div><div class="storycontent"><p class="summaryheader" data-labels="bind:innerHTML, scenarioheader"></p><p class="content" data-wrapup="bind:innerHTML, scenario.story"></p><p class="summaryheader" data-labels="bind:innerHTML, scenariosolution"></p><p class="content" data-wrapup="bind:innerHTML, scenario.solution">solution content</p></div></div><div class="ideasummary"><div class="ideaheader" data-labels="bind:innerHTML, ideatitlelbl"></div><div class="ideatitle" data-wrapup="bind:formatTitle, idea.title"></div><div class="ideacontent"><p class="summaryheader" data-labels="bind:innerHTML, ideadescription"></p><p class="content" data-wrapup="bind:innerHTML, idea.description"></p><p class="summaryheader" data-labels="bind:innerHTML, ideaimplementation"></p><p class="content" data-wrapup="bind:innerHTML, idea.solution">solution content</p></div></div></div><div class="sessionresults"><div class ="sessiontime"><span data-labels="bind:innerHTML, yourtime"></span><span data-wrapup = "bind: setTime, duration"></span></div><div class="sessionscore"><span data-labels="bind:innerHTML, yourscore"></span><span data-wrapup="bind:setScore, score"></span></div><div class="wrapupvisibility" data-wrapup="bind:setVisibility, idea.visibility"></div><div class="wrapupreplay invisible" data-wrapup="bind:setReplay, idea.sessionReplay"></div></div><div class="exit-brainstorm" data-progressevent="listen: mousedown, press; listen:mouseup, exit"></div><div class="sessioncards" data-muwrapupevent="listen:mousedown, toggleCards"><legend>Cards used during this session</legend><ul class="cardlist" data-cards="foreach"><li class="card"><div class="cardpicture" data-cards="bind:setPic,pic"></div><div class="cardtitle" data-cards="bind: formatTitle, title"></div></li></ul></div><div class="togglechat" data-wrapup="bind:alertMsg, newmsg" data-muwrapupevent="listen: mousedown, toggleChat"></div><div class="sessionchat folded" data-place="place:chat"></div></div>';
                        
                        _widget.place(Map.get("muwrapup"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                node.classList.remove("pressed");
                                $next("muwrapup");
                        };
                        
                        _widget.exit = function exit(){
                                $progress(true);        
                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("muwrapup");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress();               
                        };
                        
                        _widget.toggleCards = function(event, node){
                                node.classList.contains("expanded")?node.classList.remove("expanded"):node.classList.add("expanded");        
                        };
                        
                        _widget.toggleChat = function toggleChat(event, node){
                                _wrapup.set("newmsg", false);
                                _widget.dom.querySelector(".sessionchat").classList.toggle("folded");      
                        };
                        
                        // Getting the chat UI
                        _widget.getChatUI = function getChatUI(){
                                return chatUI;        
                        };
                        
                        _widget.reset = function reset(replay){
                                _cards.reset([]);
                                _wrapup.reset();
                                
                                chatUI.clear();
                                if ($session.get("chat")[5]){
                                        chatUI.reset($session.get("chat")[5])
                                        .then(function(){
                                                // expand chat read area in to cover write interface in case of replay
                                                if (replay){
                                                        chatUI.dom.querySelector(".chatread").classList.add("replayed");
                                                        _wrapup.set("newmsg", false);
                                                        _flash && clearInterval(_flash);
                                                }
                                                else{
                                                        chatUI.getModel().watchValue("msg", function(arr){
                                                                if(arr.length>1) {
                                                                        _wrapup.set("newmsg", true);
                                                                        setTimeout(function(){
                                                                                clearInterval(_flash);       
                                                                        }, 2500);
                                                                }
                                                        });
                                                }
                                        });
                                }
                                
                                // build wrapup UI
                                _wrapup.set("scenario", $data.get("scenario"));
                                _wrapup.set("idea", $data.get("idea"));
                                _wrapup.set("score", $session.get("score"));
                                _wrapup.set("duration", $session.get("duration"));
                                
                                _cards.reset([]);
                                
                                if (!replay){
                                        _cards.reset([
                                                $data.get("characters"),
                                                $data.get("contexts"),
                                                $data.get("problems"),
                                                $data.get("techno").get(0),
                                                $data.get("techno").get(1),
                                                $data.get("techno").get(2)        
                                        ]);
                                }
                                else{
                                        // watch $data store for cards
                        
                                        ["characters", "contexts", "problems", "techno"].forEach(function(topic){
                                                $data.watchValue(topic, function(value){
                                                        switch(topic){
                                                                case "characters":
                                                                        _cards.set(0,value);
                                                                        break;
                                                                case "contexts":
                                                                        _cards.set(1,value);
                                                                        break;
                                                                case "problems":
                                                                        _cards.set(2,value);
                                                                        break;
                                                                case "techno":
                                                                        value.loop(function(v,i){
                                                                                _cards.set(i+3,v);        
                                                                        });
                                                                        break;         
                                                        }        
                                                });  
                                        });
                                } 
                        };
                        
                        // watch session data for updates
                        $data.watchValue("scenario", function(value){
                                _wrapup.set("scenario", value);        
                        });
                        
                        $data.watchValue("idea", function(value){
                                _wrapup.set("idea", value);
                        });
                        
                        $session.watchValue("score", function(score){
                                _wrapup.set("score", score);        
                        });
                        
                        $session.watchValue("duration", function(val){
                                _wrapup.set("duration", val);        
                        });
                        
                        
                        
                        // reset chatUI
                        $session.watchValue("chat", function(arr){
                                if (arr.length === 6 && chatUI.getModel().get("_id") !== arr[5]){
                                        chatUI.reset(arr[5]);
                                        if (!chatUI.getModel().get("readonly")){
                                                chatUI.getModel().watchValue("msg", function(arr){
                                                        if(arr.length>1) {
                                                                _wrapup.set("newmsg", true);
                                                        }               
                                                });
                                        }
                                }
                        });
                        
                        // Return
                        return _widget;
                };     
        });
