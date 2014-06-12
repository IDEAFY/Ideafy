/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "Bind.plugin", "Event.plugin", "service/config", "service/utils", "Store", "service/avatar"],
        function(Widget, Model, Event, Config, Utils, Store, Avatar){
                
                function AvatarListConstructor($ids){

                        var _store = new Store([]);
                        
                        $ids.forEach(function(id){
                                _store.alter("push", {id:id});
                        });
                        
                        // setup
                        this.plugins.addAll({
                                "avatar" : new Model(_store, {
                                        setAvatar : function(id){
                                                if (id){
                                                        var _frag = document.createDocumentFragment(),
                                                              _ui = new Avatar([id]);
                                                        _ui.place(_frag);
                                                        (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                                }
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        // set template
                        this.template='<ul data-avatar="foreach"><li data-avatar="bind: setAvatar, id"></li></ul>';
                        // init

                }
                
                return function AvatarListFactory($ids){
                        AvatarListConstructor.prototype = new Widget();
                        return new AvatarListConstructor($ids);
                };      
        });