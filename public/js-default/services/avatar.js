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
                            _id = $array[0],
                            bool = false; 
                        
                        // setup
                        _cdb.setTransport(Config.get("transport"));
                        
                        this.plugins.addAll({
                                "avatar" : new Model(_store, {
                                        setStyle : function(img){
                                                if (img && img !== "in progress") {
                                                        this.setAttribute("style", "background-image: url('"+img+"');");
                                                }
                                        },
                                        setStatus : function(online){
                                                console.log("status change", _id, online);
                                                (online)?this.classList.add("online"):this.classList.remove("online");
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        // set template
                        this.template='<div class="avatar" data-avatar="bind: setStyle, img; bind: setStatus, online"></div>';
                        
                        // INIT
                        // check if user is online -- perform check every 30 seconds
                        Utils.isOnline(_id, _store);
                        
                        setInterval(function(){
                                Utils.isOnline(_id, _store);
                        }, 30000);
                        
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
        
