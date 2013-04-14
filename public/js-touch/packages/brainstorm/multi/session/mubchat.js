/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBStore", "Store", "Bind.plugin", "Event.plugin", "service/avatar", "service/utils"],
        function(Widget, Config, CouchDBStore, Store, Model, Event, Avatar, Utils){
                
                return function MUBChatConstructor(){
                
                var mubChat = new Widget(),
                    chat = new Store([]),
                    labels = Config.get("labels");
                
                mubChat.plugins.addAll({
                        "labels" : new Model(labels),
                        "model" : new Model(chat)
                });
                
                mubChat.template = '<div class="mubchat">Chat window</div>';
                
                mubChat.setReadonly = function setReadonly(){
                        chat.set("readonly", true);
                };
                
                mubChat.init = function init(){
                        
                };
                
                
                mubChat.reset = function reset(chatId, bool){
                        chat.set("readonly", bool);       
                };
        };
});