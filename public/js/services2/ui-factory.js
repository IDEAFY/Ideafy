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
        
define("Ideafy/AvatarList", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Ideafy/Utils", "Store"],
        function(Widget, Model, Event, Config, Utils, Store){
                
                function AvatarListConstructor($ids, $files){

                        var _store = new Store([]);
                            _avatars = Config.get("avatars"); 
                        // setup
                        this.plugins.addAll({
                                "avatar" : new Model(_store, {
                                        setAvatar : function(img){
                                                this.setAttribute("style", "background: url('"+img+"');");
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        // set template
                        this.template='<ul data-avatar="foreach"><li data-avatar="bind: setAvatar, img"></li></ul>'
                        
                        // init
                        for (i=0; i<$ids.length; i++){
                                if (_avatars.get($ids[i])){
                                        _store.alter("push", {id:$ids[i], img:_avatars.get($ids[i])});       
                                }
                                else {
                                        _store.alter("push", {id:$ids[i], img:"../img/avatar/deedee0.png"});
                                        Utils.getAvatar($ids[i], $files[i]);
                                }
                                _avatars.watchValue($ids[i], function(value){
                                        _store.update(i, "img", value);
                                }, this);
                        }
                             
                }
                
                return function AvatarListFactory($ids, $files){
                        AvatarListConstructor.prototype = new Widget();
                        return new AvatarListConstructor($ids,$files);
                };     
        });
