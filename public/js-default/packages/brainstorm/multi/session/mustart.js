/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "service/help", "lib/spin.min", "service/avatar", "./mubchat", "Store", "Place.plugin"],
        function(Widget, Map, Model, Event, Config, Help, Spinner, Avatar, Chat, Store, Place){
                
                return function MUStartConstructor($session, $prev, $next, $progress){
                        
                        // declaration
                        var _widget = new Widget(),
                            _user = Config.get("user"),
                            _db = Config.get("db"),
                             _labels = Config.get("labels"),
                             _next = "step",
                             participants = new Store([]),
                             chatUI = new Chat(),
                             spinner = new Spinner({color:"#657B99", lines:10, length: 8, width: 4, radius:8, top: 360, left:545}).spin();
                             // deduct 20px from position shown in navigator
                        
                        // setup
                        _widget.plugins.addAll({
                                "labels" : new Model(_labels),
                                "model" : new Model($session, {
                                        setAvatar : function setAvatar(id){
                                                var frag, ui;
                                                if (id){
                                                        this.setAttribute("style", "background:none;");
                                                        frag = document.createDocumentFragment();
                                                        ui = new Avatar([id]);
                                                        ui.place(frag);
                                                        (!this.hasChildNodes())?this.appendChild(frag):this.replaceChild(frag, this.firstChild);
                                                }
                                        },
                                        setIntro : function(intro){
                                                (intro) ? this.innerHTML = intro : this.innerHTML= " ";
                                        },
                                        setDescription : function(desc){
                                                this.innerHTML = desc.replace(/\n/g, "<br>");
                                        }
                                }),
                                participant : new Model(participants, {
                                        setAvatar : function setAvatar(id){
                                                var frag, ui;
                                                if (id){
                                                        this.setAttribute("style", "background:none;");
                                                        frag = document.createDocumentFragment();
                                                        ui = new Avatar([id]);
                                                        ui.place(frag);
                                                        (!this.hasChildNodes())?this.appendChild(frag):this.replaceChild(frag, this.firstChild);
                                                }
                                        },
                                        setIntro : function(intro){
                                                (intro) ? this.innerHTML = intro : this.innerHTML= " ";
                                        }
                                }),
                                place : new Place({"chat": chatUI}),
                                "mustartevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id = "mustart"><div class="previousbutton" data-mustartevent="listen: mousedown, press; listen: mousedown, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickstart" data-mustartevent="listen:mousedown, toggleProgress"></div><div class="help-brainstorm" data-mustartevent="listen:mousedown, help"></div><form class="mubwait-form"><div class="mubwait-title" name="title" data-model="bind:innerHTML, title"></div><div class="mubdesc"><label data-labels="bind:innerHTML, quickstepstart"></label><p name="description" data-model="bind:setDescription, description"></p></div><div class="mubroster"><label data-labels="bind:innerHTML, participants"></label><div class="mubleader contact"><div data-model="bind:setAvatar, initiator.id"></div><p class="contact-name" data-model="bind:innerHTML, initiator.username"></p><p class="contact-intro" data-model="bind:setIntro, initiator.intro"></p></div><ul class="participants" data-participant="foreach"><li class="contact"><div data-participant="bind:setAvatar, id"></div><p class="contact-name" data-participant="bind:innerHTML, username"></p><p class="contact-intro" data-participant="bind:setIntro, intro"></p></li></ul></div></form><div class="sessionchat" data-place="place:chat"></div><div>';
                        
                        _widget.place(Map.get("mustart"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.next = function(event, node){
                                
                                spinner.spin(node.parentNode);
                                node.classList.add("invisible");
                                node.classList.remove("pressed");
                                $next("mustart");

                        };
                        
                        _widget.prev = function(event, node){
                                node.classList.remove("pressed");
                                $prev("quickstart");
                        };
                        
                        _widget.toggleProgress = function(event, node){
                                $progress();               
                        };
                        
                        _widget.reset = function reset(replay){
                                _next = "step";
                                participants.reset($session.get("participants"));
                                // reset chat window
                                chatUI.reset($session.get("chat")[0])
                                .then(function(){
                                        chatUI.setReadonly();
                                        // expand chat read area in to cover write interface in case of replay
                                        if (replay){
                                                chatUI.dom.querySelector(".chatread").classList.add("extended");
                                        }
                                });
                        };
                        
                        _widget.help = function(event, node){
                                Help.setContent("mustarthelp");
                                document.getElementById("cache").classList.add("appear");
                                document.getElementById("help-popup").classList.add("appear");
                         };
                        
                        // init
                        
                        // if participants have left remove them from the displayed rosted
                        $session.watchValue("participants", function(parts){
                                participants.reset(parts);        
                        });
                        
                        // return
                        return _widget;
                };     
        });
