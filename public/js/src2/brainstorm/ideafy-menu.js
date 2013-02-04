/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Brainstorm/Menu", ["Olives/OObject", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Store, Model, Event, Config){
                
                return function IdeafyMenuConstructor($selectScreen){
                        
                        // declaration
                        var _widget = new Widget(),
                            _user = Config.get("user"),
                            _labels = Config.get("labels"),
                            _menu = new Store(),
                            _last = {"name": "continue", "active": true, "selected": false, "label": _labels.get("continuesession"), "bg": "continuesession.png", "bgselected":"continueactive.png"},
                            _sip = ""; // session in progress
                        
                        // setup     
                        _widget.plugins.addAll({
                                "ideafymenu" : new Model(_menu, {
                                        setActive : function(active){
                                                (active)?this.classList.remove("inactive"):this.classList.add("inactive");
                                        },
                                        setBg : function(selected){
                                                var id=this.getAttribute("data-ideafymenu_id");
                                                if (selected){
                                                        this.setAttribute("style", "background-image:url('../img/brainstorm/"+_menu.get(id).bgselected+"');color:white;")
                                                }
                                                else{
                                                        this.setAttribute("style", "background-image:url('../img/brainstorm/"+_menu.get(id).bg+"');color:#4D4D4D;")        
                                                }
                                        }
                                }),
                                "labels" : new Model(_labels),
                                "ideafyevent" : new Event(this)
                        });       
                        
                        _widget.alive(Map.get("ideafy-menu"));
                        
                        this.press = function(event, node){
                                var _id = node.getAttribute("data-ideafymenu_id");
                                _menu.update(_id, "selected", true);
                                node.classList.add("pressed");        
                        };
                        
                        this.start = function(event, node){
                                var id = node.getAttribute("data-ideafymenu_id");
                                (_menu.get(id).name === "continue") ? $selectScreen("continue", _sip) :$selectScreen(_menu.get(id).name);
                                node.classList.remove("pressed");
                                _menu.update(id, "selected", false);
                        };
                        
                        _widget.addContinue = function addContinue(sip){
                                var arr = JSON.parse(_menu.toJSON());
                                if (_menu.get(0).name !== "continue") {
                                        arr.unshift(_last);
                                        _menu.reset(arr);
                                }
                                _sip = sip;                
                        };
                        
                        _widget.removeContinue = function removeContinue(){
                                var arr = JSON.parse(_menu.toJSON());
                                if (arr[0]. name === "continnue") arr.splice(0,1);
                                _menu.reset(arr);
                                _sip = "";        
                        };
                        
                        _widget.reset = function reset(){
                                _menu.reset([
                                {"name": "quick", "active": true, "selected": false, "label": _labels.get("quickbmode"), "bg":"quick.png", "bgselected":"quickactive.png"},
                                {"name": "musession", "active": false, "selected": false, "label": _labels.get("musession"), "bg":"multiuser.png", "bgselected":"multiuseractive.png"},
                                {"name": "customb", "active": false, "selected": false, "label": _labels.get("customsession"), "bg":"customb.png", "bgselected":"custombactive.png"},
                                {"name": "tutorial", "active": true, "selected": false, "label": _labels.get("ideafytutorial"), "bg":"tutorial.png", "bgselected":"tutorialactive.png"}       
                                ]);
                                // if last session was incomplete add "continue option" to the top of the list
                                if (_user.get("sessionInProgress") && _user.get("sessionInProgress").id){
                                        _widget.addContinue(_user.get("sessionInProgress"));      
                                }        
                        };
                        
                        // init
                        _widget.reset();
                        
                        // watch sessionInProgess value in user document
                        _user.watchValue("sessionInProgress", function(sip){
                                (sip.id && sip.type) ? _widget.addContinue(sip) : _widget.removeContinue();
                        });
                        
                        // watch for language change
                        _user.watchValue("lang", function(){
                                console.log(_labels.get("continuesessions"));
                                setTimeout(function(){console.log(_labels.get("continuesessions"));}, 1000);
                                _menu.loop(function(v,i){
                                        switch(v.name){
                                                case "continue":
                                                        _menu.update(i, "label", _labels.get("continuesession"));
                                                        break;
                                                case "quick":
                                                        _menu.update(i, "label", _labels.get("quickbmode"));
                                                        break;
                                                case "musession":
                                                        _menu.update(i, "label", _labels.get("musession"));
                                                        break;
                                                case "customb":
                                                        _menu.update(i, "label", _labels.get("customsession"));
                                                        break;
                                                case "tutorial":
                                                        _menu.update(i, "label", _labels.get("ideafytutorial"));
                                                        break;        
                                        }    
                                });  
                        });
                        
                        //return
                        return _widget;
                }; 
        });
