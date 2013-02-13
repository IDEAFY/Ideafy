/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "service/config", "Store", "service/utils"],
        function(Widget, Model, Event, Config, Store, Utils){
                
                function AvatarConstructor($array){

                        var _store = new Store(),
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
                        else if (_id === Config.get("user").get("_id")) {
                                _store.set("img", Config.get("avatar"));
                                Config.watchValue("avatar", function(){
                                        _store.set("img", Config.get("avatar"));        
                                });
                        }
                        else if (_id === "ideafy@taiaut.com" || _id === "IDEAFY") _store.set("img", "img/avatars/doctordeedee.png")
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
        
