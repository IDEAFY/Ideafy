/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../libs/olives"),
      emily = require("../libs/emily"),
      Widget = olives.OObject,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Store = emily.Store,
      Config = require("./config"),
      Utils = require("./utils");

var AvatarListConstructor = function($ids){

        var _store = new Store([]); 
        
        $ids.forEach(function(id){
                _store.alter("push", {id:id});
        });
        
        // setup
        this.seam.addAll({
                "avatar" : new Model(_store, {
                        setAvatar : function(id){
                                if (id){
                                        var _frag = document.createDocumentFragment(),
                                              _ui = new Avatar([id]);
                                        _ui.place(_frag);
                                        (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                }
                        }
                })
        });
                        
        // set template
        this.template='<ul data-avatar="foreach"><li data-avatar="bind: setAvatar, id"></li></ul>';
};
                
module.exports = function AvatarListFactory($ids){
        AvatarListConstructor.prototype = new Widget();
        return new AvatarListConstructor($ids);
};
