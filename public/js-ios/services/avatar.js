/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "service/config", "Store", "service/utils", "CouchDBView"],
        function(Widget, Model, Event, Config, Store, Utils, CouchDBView){
                
                function AvatarConstructor($array){

                        var _store = new Store({"img":"", "online": false}),
                            _avatars = Config.get("avatars"),
                            _cdb = new CouchDBView([]),
                            _id = $array[0]; 
                        
                        _cdb.setTransport(Config.get("transport"));
                        
                        // setup
                        this.plugins.addAll({
                                "avatar" : new Model(_store, {
                                        setStyle : function(img){
                                                if (img && img !== "in progress") {
                                                        this.setAttribute("style", "background-image: url('"+img+"');");
                                                }
                                        },
                                        setStatus : function(online){
                                                (online)?this.classList.add("online"):this.classList.remove("online");
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        // set template
                        this.template='<div class="avatar" data-avatar="bind: setStyle, img; bind: setStatus, online"></div>';
                        
                        // init
                        // check if user is online
                        _cdb.sync(Config.get("db"), "users", "_view/online", {key: '"'+_id+'"'})
                        .then(function(){
                                (_cdb.get(0)) ? _store.set("online", true) : _store.set("online", false);       
                        });
                        // watch for updates
                        ["added", "deleted", "updated"].forEach(function(change){
                                _cdb.watch(change, function(){
                                        (_cdb.get(0)) ? _store.set("online", true) : _store.set("online", false);
                                });
                        });
                        
                        if ($array.length>1) {
                                _store.set("img", "img/avatars/deedee6.png");
                        }
                        else if (_id === Config.get("user").get("_id")) {
                                _store.set("img", Config.get("avatar"));
                                Config.watchValue("avatar", function(){
                                        _store.set("img", Config.get("avatar"));        
                                });
                        }
                        else if (_id === "ideafy@taiaut.com" || _id === "IDEAFY") {
                                _store.set("img", "img/avatars/doctordeedee.png");
                        }
                        
                        else if (_avatars.get(_id)){
                                if (_avatars.get(_id) === "in progress"){
                                        _avatars.watchValue(_id, function(val){
                                                if (val && (val !== "in progress")){
                                                        _store.set("img", val);
                                                }
                                        });
                                }
                                else {
                                        _store.set("img", _avatars.get(_id));
                                }
                        }
                        else {
                                Utils.getAvatarById(_id).then(function(res){
                                        _store.set("img", _avatars.get(_id));
                                });
                        }
                             
                }
                
                return function AvatarFactory($id){
                        AvatarConstructor.prototype = new Widget();
                        return new AvatarConstructor($id);
                };      
        });
        
