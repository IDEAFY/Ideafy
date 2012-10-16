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
                                                this.setAttribute("style", "background-image: url('"+img+"');");
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        // set template
                        this.template='<ul data-avatar="foreach"><li data-avatar="bind: setAvatar, img; bind: name, id"></li></ul>'
                        
                        // init
                        for (i=0; i<$ids.length; i++){
                                if ($ids[i] === Config.get("user").get("_id")){
                                        _store.alter("push", {id:$ids[i], img: Config.get("avatar")});
                                }
                                else if (_avatars.get($ids[i])){
                                        _store.alter("push", {id:$ids[i], img:_avatars.get($ids[i])});       
                                }
                                else {
                                        if ($files[i].search("img/avatars")>-1)  _store.alter("push", {id:$ids[i], img:$files[i]});
                                        else{
                                                Config.get("transport").request("GetAvatar", {id: $ids[i], file:$files[i]}, function(result){
                                                        if (!result.error){
                                                                _store.alter("push", {id: $ids[i], img: result});
                                                        }
                                                });
                                        }
                                }
                        }
                             
                }
                
                return function AvatarListFactory($ids, $files){
                        AvatarListConstructor.prototype = new Widget();
                        return new AvatarListConstructor($ids,$files);
                };     
        });
        
define("Ideafy/Avatar", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store", "Ideafy/Utils"],
        function(Widget, Model, Event, Config, Store, Utils){
                
                function AvatarConstructor($array){

                        var _store = new Store([]),
                            _avatars = Config.get("avatars"),
                            _id = $array[0]; 
                        
                        // setup
                        this.plugins.addAll({
                                "avatar" : new Model(_store, {
                                        setStyle : function(img){
                                                this.setAttribute("style", "background-image: url('"+img+"');");
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        // set template
                        this.template='<div class="avatar" data-avatar="bind: setStyle, img"></div>'
                        
                        // init
                        if ($array.length>1) _store.set("img", "img/avatars/deedee6.png")
                        else if (_id === Config.get("user").get("_id")) _store.set("img", Config.get("avatar"))
                        else if (_avatars.get(_id)) _store.set("img", _avatars.get(_id))
                        else {
                                Utils.getAvatarById(_id).then(function(){
                                        _store.set("img", _avatars.get(_id));
                                });
                        }
                             
                }
                
                return function AvatarFactory($id){
                        AvatarConstructor.prototype = new Widget();
                        return new AvatarConstructor($id);
                };     
        });
        

