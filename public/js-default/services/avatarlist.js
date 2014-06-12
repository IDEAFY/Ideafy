/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "Bind.plugin", "Event.plugin", "service/config", "service/utils", "Store"],
        function(Widget, Model, Event, Config, Utils, Store){
                
                function AvatarListConstructor($ids){

                        var _store = new Store([]),
                            i,
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
                        this.template='<ul data-avatar="foreach"><li data-avatar="bind: setAvatar, img; bind: name, id"></li></ul>';
                        // init
                        for (i=0; i<$ids.length; i++){
                                if ($ids[i] === Config.get("user").get("_id")){
                                        _store.alter("push", {id:$ids[i], img: Config.get("avatar")});
                                }
                                else if (_avatars.get($ids[i])){
                                        _store.alter("push", {id:$ids[i], img:_avatars.get($ids[i])});
                                }
                                else {
                                        Config.get("transport").request("GetAvatar", {id: $ids[i]}, function(result){
                                                        if (!result.error){
                                                                _store.alter("push", {id: $ids[i], img: result});
                                                        }
                                        });
                                }
                        }
                        
                        // watch for avatar updates
                        $ids.forEach(function(id){
                                _avatars.watchValue(id, function(img){
                                        if (img){
                                                _store.loop(function(v,i){
                                                        if (v.id === id){
                                                                _store.update(i, {id:id, img:img});
                                                        }
                                                });
                                        }        
                                });                           
                        });
                             
                }
                
                return function AvatarListFactory($ids){
                        AvatarListConstructor.prototype = new Widget();
                        return new AvatarListConstructor($ids);
                };      
        });