/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBStore", "Store", "Bind.plugin", "Event.plugin", "service/avatar", "service/utils","lib/spin.min", "Promise"],
        function(Widget, Config, CouchDBStore, Store, Model, Event, Avatar, Utils, Spinner, Promise){
                
                function MUBChatConstructor(){
                
                var mubChat = this,
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
                                        if (readonly){
                                                this.setAttribute("contenteditable", false);
                                                this.classList.add("invisible");
                                        }
                                        else{
                                                this.setAttribute("contenteditable", true);
                                        }
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
                                                this.setAttribute("style", "background: #9AC9CD; border: 1px solid #808080; border-radius: 5px;");
                                        }
                                        else{
                                                this.setAttribute("style", "background: #E6E6E6; border: 1px solid #808080; border-radius: 5px;float: left;max-width: 556px;");        
                                        }        
                                },
                                setTime : function(time){
                                        if (time) {
                                                this.innerHTML = Utils.formatTime(time);
                                        }
                                },
                                setAvatar : function(user){
                                        var frag, ui, uid;
                                        if (user === "SYS"){
                                                this.classList.remove("invisible");
                                                this.classList.add("doctor-deedee");       
                                        }
                                        else if (user === position){
                                                this.classList.add("invisible");
                                        }
                                        else if (typeof user === "number"){
                                                this.classList.remove("invisible");
                                                frag = document.createDocumentFragment();
                                                uid = chatCDB.get("users")[user].userid;
                                                ui = new Avatar([uid]);
                                                ui.place(frag);
                                                (!this.hasChildNodes())?this.appendChild(frag):this.replaceChild(frag, this.firstChild);
                                        }       
                                },
                                setUserName : function(user){
                                        if (typeof user === "number" && user !== position){
                                                this.innerHTML = " "+ chatCDB.get("users")[user].username + labels.get("said");
                                        }        
                                },
                                setMsg : function(msg){
                                        var id, type;
                                        if (msg) {
                                                this.innerHTML = msg;
                                                this.setAttribute("style", "color: #292929; font-size: 16px;");
                                        }
                                        else{
                                               // display system message
                                               this.setAttribute("style", "color: #CCCCCC; font-size: 14px;");
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
                
                mubChat.template = '<div class="mubchat"><div id="chatspinner"></div><div class="chatread"><ul id="chatmessages" data-chat="foreach"><li data-chat="bind:setLiStyle, user"><div class="container" data-chat="bind:setAvatar, user"></div><div class="innerchatmsg" data-chat="bind:setInnerMsgStyle, user"><span class="time" data-chat="bind: setTime, time"></span><span class="username" data-chat="bind:setUserName, user"></span><br/><span class="chatmsg" data-chat="bind: setMsg, msg"></span></div></li></ul></div><div class="chatwrite placeholder" data-model="bind: setReadonly, readonly" data-labels="bind:innerHTML, typemsg" data-chatevent = "listen:touchstart, removePlaceholder; listen: keypress, post"></div></div>';
                
                mubChat.removePlaceholder = function(event, node){
                        if (node.innerHTML === labels.get("typemsg")){
                                node.innerHTML = "";
                                node.classList.remove("placeholder");
                        }       
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
                                chatCDB.set("msg", msg);
                                
                                // clear write interface
                                node.innerHTML = labels.get("typemsg");
                                node.classList.add("placeholder");
                                node.blur();
                                
                                // upload to couchDB
                                chatCDB.upload();       
                        }
                };
                
                mubChat.setReadonly = function setReadonly(){
                        chatCDB.set("readonly", true);
                };
                
                mubChat.startingSession = function startingSession(){
                        var now = new Date().getTime(), msg = chatCDB.get("msg"), id;
                        mubChat.setReadonly();
                        chat.alter("push", {"user": "SYS", "time": now, "type": 4});
                        id = chat.getNbItems()-1;
                        document.getElementById("chatmessages").querySelector("li[data-chat_id='"+id+"']").scrollIntoView();
                        
                        msg.push({"user": "SYS", "time": now, "type": 4});
                        chatCDB.set("msg", msg);
                        
                        chatCDB.upload();
                };
                
                mubChat.clear = function clear(){
                        chat.reset([]);
                };
                
                mubChat.reset = function reset(chatId){
                        chatCDB.unsync();
                        chatCDB.reset();
                        chat.reset([]); 
                        spinner.spin(document.getElementById("chatspinner"));
                        console.log(chatId);
                        chatCDB.sync(Config.get("db"), chatId).then(function(){
                                var i, arr = chatCDB.get("users");
                                
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
                        console.log(chatCDB.get("_rev"));
                        chatCDB.upload().then(function(){
                                position = pos;
                                console.log(chatCDB.get("_rev"));
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
                                chatCDB.reset();
                                chat.reset([]);       
                        });
                        return promise;
                };
                
                mubChat.cancel = function cancel(){
                        chatCDB.remove();
                        chatCDB.unsync();
                        chatCDB.reset();
                        chat.reset([]);
                };
                
                mubChat.getModel = function getModel(){
                        return chatCDB;
                };
                
                chatCDB.watchValue("msg", function(arrCDB){
                        var l = arrCDB.length - 1; 
                        chat.reset(arrCDB);
                        document.getElementById("chatmessages").querySelector("li[data-chat_id='"+l+"']").scrollIntoView();    
                });
        }
        
        return function MUBChatFactory(){
                MUBChatConstructor.prototype = new Widget();
                return new MUBChatConstructor();        
        };
        
        
});