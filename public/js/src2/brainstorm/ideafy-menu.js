define("Ideafy/Brainstorm/Menu", ["Olives/OObject", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Map, Store, Model, Event, Config){
                
                return function IdeafyMenuConstructor(){

                        var _widget = new Widget(),
                            _labels = Config.get("labels"),
                            _menu = new Store([
                                {"name": "quickb", "active": true, "label": _labels.get("quickbmode"), "bg":"quick.png", "bgselected":"quickactive.png"},
                                {"name": "musession", "active": true, "label": _labels.get("musession"), "bg":"multiuser.png", "bgselected":"multiuseractive.png"},
                                {"name": "customb", "active": true, "label": _labels.get("customsession"), "bg":"customb.png", "bgselected":"custombactive.png"},
                                {"name": "tutorial", "active": true, "label": _labels.get("ideafytutorial"), "bg":"tutorial.png", "bgselected":""}       
                            ]);
                        console.log("here it works");     
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
                        
                        return _widget;
                }; 
        });
