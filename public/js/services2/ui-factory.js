define("Ideafy/SubMenu", ["Olives/OObject", "Olives/Model-plugin", "Amy/Control-plugin", "Config"],
        function(Widget, Model, Control, Config){
                
                function SubMenuConstructor($dom, $setWidget){

                        var _active = false,
                            toggleActive = function (state){
                                (state) ? $dom.setAttribute("style", "display : block;") : $dom.setAttribute("style", "display : none;");
                                _active = state;        
                            };
                            
                        // setup
                        this.plugins.addAll({
                                "label" : new Model(Config.get("labels")),
                                "menucontrol" : new Control(this)
                        });
                        
                        this.getState = function getState(){
                                return _active;
                        };
                        
                        this.toggleActive = function (state){
                                toggleActive(state);
                        };
                        
                        this.setCurrentWidget = function setCurrentWidget(event){
                                var ui = event.target.getAttribute("name");
                                $setWidget(ui);
                                setTimeout(function(){toggleActive(false);}, 500);
                        };
                        
                        this.alive($dom);     
                }
                
                return function SubMenuFactory($dom, $setWidget){
                        SubMenuConstructor.prototype = new Widget();
                        return new SubMenuConstructor($dom,$setWidget);
                };     
        });
