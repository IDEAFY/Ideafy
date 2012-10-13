define("Ideafy/Brainstorm/Menu", ["Olives/OObject", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Store, Model, Event, Config){
                
                return function IdeafyMenuConstructor($selectScreen){
                        
                        // declaration
                        var _widget = new Widget(),
                            _user = Config.get("user"),
                            _labels = Config.get("labels"),
                            _menu = new Store(),
                            _last = {"name": "continue", "active": true, "label": _labels.get("continuesession"), "bg": "continuesession.png", "bgselected":"continueactive.png"},
                            _sip = ""; // session in progress
                        
                        // setup     
                        _widget.plugins.addAll({
                                "ideafymenu" : new Model(_menu, {
                                        setActive : function(active){
                                                (active)?this.classList.remove("inactive"):this.classList.add("inactive");
                                        },
                                        setBg : function(bg){
                                                this.setAttribute("style", "background-image:url('../img/brainstorm/"+bg+"');")
                                        }
                                }),
                                "labels" : new Model(_labels),
                                "ideafyevent" : new Event(this)
                        });       
                        
                        _widget.alive(Map.get("ideafy-menu"));
                        
                        this.press = function(event, node){
                                var _id = node.getAttribute("data-ideafymenu_id");
                                node.setAttribute("style", "background-image:url('../img/brainstorm/"+_menu.get(_id).bgselected+"');color:white;")
                                node.classList.add("pressed");        
                        };
                        
                        this.start = function(event, node){
                                var id = node.getAttribute("data-ideafymenu_id");
                                (id>0) ? $selectScreen(_menu.get(id).name) : $selectScreen(_menu.get(0).name, _sip);    
                        };
                        
                        _widget.addContinue = function addContinue(sip){
                                var arr = JSON.parse(_menu.toJSON());
                                arr.unshift(_last);
                                _menu.reset(arr);
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
                                {"name": "quick", "active": true, "label": _labels.get("quickbmode"), "bg":"quick.png", "bgselected":"quickactive.png"},
                                {"name": "musession", "active": false, "label": _labels.get("musession"), "bg":"multiuser.png", "bgselected":"multiuseractive.png"},
                                {"name": "customb", "active": false, "label": _labels.get("customsession"), "bg":"customb.png", "bgselected":"custombactive.png"},
                                {"name": "tutorial", "active": true, "label": _labels.get("ideafytutorial"), "bg":"tutorial.png", "bgselected":"tutorialactive.png"}       
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
                        
                        //return
                        return _widget;
                }; 
        });
