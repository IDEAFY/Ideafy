/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBStore", "Store", "Bind.plugin", "Event.plugin", "service/avatar", "service/utils","lib/spin.min"],
        function(Widget, Config, CouchDBStore, Store, Model, Event, Avatar, Utils, Spinner){
                
                return function MUBChatConstructor(){
                
                var mubChat = new Widget(),
                    chat = new Store([]),
                    chatCDB = new CouchDBStore(),
                    labels = Config.get("labels"),
                    user = Config.get("user"),
                    position, // used to determine the position of the user in the chat participants group
                    spinner = new Spinner({color:"#9AC9CD", lines:10, length: 10, width: 6, radius:10, top: 20}).spin();
                
                chatCDB.setTransport(Config.get("transport"));
                
                mubChat.plugins.addAll({
                        "labels" : new Model(labels),
                        "model" : new Model(chatCDB,{
                                setReadonly : function(readonly){
                                        (readonly)?this.setAttribute("contenteditable", false) : this.setAttribute("contenteditable", true);
                                }
                        }),
                        "chat" : new Model(chat, {
                                setTime : function(time){
                                        this.innerHTML = new Date(time).toTimeString();
                                },
                                setStyle : function(user){
                                        if (user === "SYS"){
                                                this.setAttribute("style", "color: #CCCCCC; font-style: italic;");
                                        }
                                        else {
                                                this.setAttribute("style", "color: #292929; font-style: normal;");
                                        }
                                }
                        }),
                        "chatevent" : new Event(mubChat)
                });
                
                mubChat.template = '<div class="mubchat"><div id="chatspinner"></div><div class="chatread">Read messages<ul id="chatmessages" data-chat="foreach"><li><div class="avatar"></div><p class="time" data-chat="bind: setTime, time"></p><p class="msg" data-chat="bind: innerHTML, msg; bindsetStyle, user"></p></li></ul></div><div class="chatwrite" data-model="bind: setReadonly, readonly" data-chatevent = "listen: keypress, post">Write message</div></div>';
                
                mubChat.post = function(event,node){
                        var now, msg, id;
                        if (event.keyCode === 13 && node.innerHTML !== ""){
                                now = new Date().getTime();
                                msg = chatCDB.get("msg");
                                
                                // display message immediately
                                chat.alter("push", {"user": position, "time": now, "msg": node.innerHTML});
                                id = chat.getNbItems()-1;
                                document.getElementById("chatmessages").querySelector("li[data-chat_id='"+id+"']").scrollIntoView();
                                
                                // push message to couchdb
                                msg.push({"user": position, "time": now, "msg": node.innerHTML});
                                // upload to couchDB
                                chatCDB.set("msg", msg);
                                chatCDB.upload().then(function(){
                                        // clear write interface
                                        node.innerHTML = "";
                                });       
                        }
                };
                
                mubChat.setReadonly = function setReadonly(){
                        chatCDB.set("readonly", true);
                        chatCDB.upload();
                };
                
                mubChat.reset = function reset(chatId){
                        spinner.spin(document.getElementById("chatspinner"));
                        chatCDB.sync(Config.get("db"), chatId).then(function(){
                                var i, arr = chatCDB.get("users");
                                
                                chat.reset(chatCDB.get("msg"));
                                
                                // get user position
                                for (i=0; i<arr.length; i++){
                                        if (arr[i].userid === user.get("_id")){
                                                position = i;
                                                break;        
                                        }
                                }
                                
                                // check if user has joined already - if not join provided chat session is opened (vs. replay/readonly)
                                if (isNaN(position) && !chatCDB.get("readonly")){
                                        mubChat.join().then(function(){
                                                chat.reset(chatCDB.get("msg"));
                                                spinner.stop();       
                                        });        
                                }
                                
                                else{
                                        chat.reset(chatCDB.get("msg"));
                                        spinner.stop();
                                }       
                        });
                              
                };
                
                mubChat.join = function join(){
                        var promise = new Promise(),
                            arr = chatCDB.get("users"),
                            pos= arr.length,
                            now = new Date().getTime(),
                            msg = chatCDB.get("msg");
                                
                        arr.push({"username": user.get("username"), "userid": user.get("_id")});
                        msg.push({user: "SYS", time: now, type: 1, arg: pos});
                        chatCDB.set("users", arr);
                        chatCDB.set("msg", msg);
                        chatCDB.upload().then(function(){
                                position = pos;
                                promise.fulfill();
                        });
                        return promise;
                };
                
                mubChat.leave = function leave(){
                        var users = chatCDB.get("users"),
                            msg = chatCDB.get("msg");
                        users.splice(position, 1);
                        msg.push({user: "SYS", type: 2, time: now, arg: position})
                        chatCDB.set("users", users);
                        chatCDB.set("msg", msg);
                        chatCDB.upload().then(function(){
                                chatCDB.unsync();        
                        });  
                };
                
                mubChat.cancel = function cancel(){
                        
                        chatCDB.remove();        
                };
                
                return mubChat;
        };
});