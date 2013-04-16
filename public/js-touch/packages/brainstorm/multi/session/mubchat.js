/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBStore", "Store", "Bind.plugin", "Event.plugin", "service/avatar", "service/utils","lib/spin.min", "Promise"],
        function(Widget, Config, CouchDBStore, Store, Model, Event, Avatar, Utils, Spinner, Promise){
                
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
                                setLiStyle : function(user){
                                        if (user === position){
                                                this.setAttribute("style", "text-align: right;");
                                        }
                                        else{
                                                this.setAttribute("style", "text-align: left;");        
                                        }
                                },
                                setInnerMsgStyle : function(user){
                                        if (user === "SYS"){
                                                this.setAttribute("style", "background: none; border: none");
                                        }
                                        else if (user === position){
                                                this.setAttribute("style", "background: #9AC9CD; border: 1px solid #404040; border-radius: 5px;");
                                        }
                                        else{
                                                this.setAttribute("style", "background: #E6E6E6; border: 1px solid #404040; border-radius: 5px;");        
                                        }        
                                },
                                setTime : function(time){
                                        this.innerHTML = Utils.formatTime(time);
                                },
                                setAvatar : function(user){
                                        var frag, ui, userid;
                                        if (user === "SYS"){
                                                this.classList.remove("invisible");
                                                this.innerHTML = "doctor dee-dee";       
                                        }
                                        else if (user === position){
                                                this.classList.add("invisible");
                                        }
                                        else{
                                                this.classList.remove("invisible");
                                                frag = document.createDocumentFragment();
                                                console.log("before getting userid", user, chatCDB.toJSON());
                                                userid = chatCDB.get("users")[user].userid;
                                                console.log(userid);
                                                ui = new Avatar([userid]);
                                                ui.place(frag);
                                                (!this.hasChildNodes())?this.appendChild(frag):this.replaceChild(frag, this.firstChild);
                                        }       
                                },
                                setMsgStyle : function(user){
                                        if (user === "SYS"){
                                                this.setAttribute("style", "color: #CCCCCC;");
                                        }
                                        else {
                                                this.setAttribute("style", "color: #292929;");
                                        }
                                },
                                setMsg : function(msg){
                                        var id, type;
                                        if (msg) {
                                                this.innerHTML = msg;
                                        }
                                        else{
                                               // display system message
                                               id = this.getAttribute("data-chat_id");
                                               type = chat.get(id).type;
                                               if (type <= 3){
                                                       this.innerHTML = chatCDB.get("users")[chat.get(id).arg].username + labels.get("chatmsg"+type);
                                               }
                                               else {
                                                       this.innerHTML = labels.get("chatmsg"+type);
                                               }
                                        }
                                }
                        }),
                        "chatevent" : new Event(mubChat)
                });
                
                mubChat.template = '<div class="mubchat"><div id="chatspinner"></div><div class="chatread"><ul id="chatmessages" data-chat="foreach"><li data-chat="bind: setLiStyle, user"><div class="innerchatmsg" data-chat="bind:setInnerMsgStyle, user"><div class="avatar" data-chat="bind:setAvatar, user"></div><span class="time" data-chat="bind: setTime, time"></span><br/><span class="chatmsg" data-chat="bind: setMsg, msg; bind:setMsgStyle, user"></span></div></li></ul></div><div class="chatwrite placeholder" data-model="bind: setReadonly, readonly" data-labels="bind:innerHTML, typemsg" data-chatevent = "listen:touchstart, removePlaceholder; listen: keypress, post"></div></div>';
                
                mubChat.removePlaceholder = function(event, node){
                        node.innerHTML = "";
                        node.classList.remove("placeholder");        
                };
                
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
                                console.log("before post upload : ", chatCDB.toJSON());
                                chatCDB.upload().then(function(){
                                        // clear write interface
                                        node.innerHTML = labels.get("typemsg");
                                        node.classList.add("placeholder");
                                        node.blur();
                                });       
                        }
                };
                
                mubChat.setReadonly = function setReadonly(){
                        chatCDB.set("readonly", true);
                        chatCDB.upload();
                };
                
                mubChat.reset = function reset(chatId){
                        chatCDB.reset();
                        chat.reset([]); 
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
                                        mubChat.joinChat().then(function(){
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
                
                mubChat.joinChat = function joinChat(){
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
                        var promise = new Promise(),
                            users = chatCDB.get("users"),
                            msg = chatCDB.get("msg");
                        users.splice(position, 1);
                        msg.push({user: "SYS", type: 2, time: now, arg: position});
                        chatCDB.set("users", users);
                        chatCDB.set("msg", msg);
                        chatCDB.upload().then(function(){
                                promise.fulfill();
                                chatCDB.unsync();        
                        });
                        return promise;
                };
                
                mubChat.cancel = function cancel(){
                        chatCDB.remove();
                        chatCDB.unsync();
                };
                
                chatCDB.watchValue("msg", function(arrCDB){
                        var l = arrCDB.length - 1; 
                        chat.reset(arrCDB);
                        document.getElementById("chatmessages").querySelector("li[data-chat_id='"+l+"']").scrollIntoView();    
                });
                
                return mubChat;
        };
});