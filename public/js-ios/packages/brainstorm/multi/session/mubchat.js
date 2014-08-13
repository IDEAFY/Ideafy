/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../../libs/olives"),
      emily = require("../../../../libs/emily"),
      CouchDBTools = require("../../../../libs/CouchDBTools"),
      Widget= olives.OObject,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      CouchDBDocument = CouchDBTools.CouchDBDocument,
      Config = require("../../../../services/config"),
      Promise = emily.Promise,
      Store = emily.Store,
      Utils = require("../../../../services/utils"),
      Spinner = require("../../../../libs/spin.min"),
      Avatar = require("../../../../services/avatar");

function MUBChatConstructor(){
                
                var mubChat = this,
                    chat = new Store([]),
                    chatCDB = new CouchDBDocument(),
                    labels = Config.get("labels"),
                    user = Config.get("user"),
                    position = "null", // used to determine the position of the user in the chat participants group
                    spinner = new Spinner({color:"#9AC9CD", lines:10, length: 10, width: 6, radius:10, top: 20}).spin();
                
                chatCDB.setTransport(Config.get("transport"));
                
                mubChat.seam.addAll({
                        "labels" : new Model(labels),
                        "model" : new Model(chatCDB,{
                                setReadonly : function(readonly){
                                        if (readonly){
                                                this.setAttribute("contenteditable", false);
                                                this.setAttribute("style", "display:none;");
                                        }
                                        else{
                                                this.setAttribute("style", "display:table-cell;");
                                                this.setAttribute("contenteditable", true);
                                        }
                                },
                                setHeight : function(readonly){
                                        (readonly)?this.classList.add("extended"):this.classList.remove("extended");
                                }
                        }),
                        "chat" : new Model(chat, {
                                setLiStyle : function(usr){
                                        if (usr === position){
                                                this.setAttribute("style", "text-align: right;");
                                        }
                                        else{
                                                this.setAttribute("style", "text-align: left;");        
                                        }
                                },
                                setInnerMsgStyle : function(usr){
                                        if (usr === "SYS"){
                                                this.setAttribute("style", "background: none; border: none");
                                        }
                                        else if (usr === position){
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
                                setAvatar : function(usr){
                                        var frag, ui, uid;
                                        if (usr === "SYS"){
                                                this.classList.remove("invisible");
                                                this.classList.add("doctor-deedee");       
                                        }
                                        else if (usr === position){
                                                this.classList.add("invisible");
                                        }
                                        else if (typeof usr === "number"){
                                                this.classList.remove("invisible");
                                                frag = document.createDocumentFragment();
                                                uid = chatCDB.get("users")[usr].userid;
                                                ui = new Avatar([uid]);
                                                ui.place(frag);
                                                (!this.hasChildNodes())?this.appendChild(frag):this.replaceChild(frag, this.firstChild);
                                        }       
                                },
                                setUserName : function(usr){
                                        if (typeof usr === "number" && usr !== position){
                                                this.innerHTML = " "+ chatCDB.get("users")[usr].username + labels.get("said");
                                        }        
                                },
                                setMsg : function(msg){
                                        var id, type;
                                        if (msg) {
                                                this.innerHTML = msg;
                                                this.setAttribute("style", "color: #292929; font-size: 14px;");
                                        }
                                        else{
                                               // display system message
                                               this.setAttribute("style", "color: #CCCCCC; font-size: 12px;");
                                               id = this.getAttribute("data-chat_id");
                                               type = chat.get(id).type;
                                               if (type <= 3){
                                                       this.innerHTML = chatCDB.get("users")[chat.get(id).arg].username + labels.get("chatmsg"+type);
                                               }
                                               else if (type === 5){
                                                       this.innerHTML = labels.get("chatmsg"+type)+labels.get(chat.get(id).arg);
                                               }
                                               else {
                                                       this.innerHTML = labels.get("chatmsg"+type);
                                               }
                                        }
                                }
                        }),
                        "chatevent" : new Event(mubChat)
                });
                
                mubChat.template = '<div class="mubchat"><div id="chatspinner"></div><div class="chatread" data-model="bind:setHeight, readonly"><ul class="chatmessages" data-chat="foreach"><li data-chat="bind:setLiStyle, user"><div class="container" data-chat="bind:setAvatar, user"></div><div class="innerchatmsg" data-chat="bind:setInnerMsgStyle, user"><span class="time" data-chat="bind: setTime, time"></span><span class="username" data-chat="bind:setUserName, user"></span><br/><span class="chatmsg" data-chat="bind: setMsg, msg"></span></div></li></ul></div><div class="chatwrite placeholder" data-model="bind:setReadonly, readonly" data-labels="bind:innerHTML, typemsg" data-chatevent = "listen:touchstart, removePlaceholder; listen: keypress, post"></div></div>';
                
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
                                mubChat.dom.querySelector("li[data-chat_id='"+id+"']").scrollIntoView();
                                
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
                
                mubChat.conclude = function conclude(reason){
                        mubChat.setReadonly();
                        mubChat.setMessage(reason);
                };
                
                mubChat.setMessage = function setMessage(message, arg){
                        var now = new Date().getTime(), msg = chatCDB.get("msg"), id, newMsg, promise = new Promise();
                        switch(message){
                                case "start":
                                        newMsg = {"user": "SYS", "time": now, "type": 4};
                                        break;
                                case "end":
                                        // automatically insert leader leave message
                                        chat.alter("push", {user: "SYS", type: 2, time: now, arg: position});
                                        msg.push({user: "SYS", type: 2, time: now, arg: position});
                                        
                                        now = new Date().getTime();
                                        newMsg ={"user": "SYS", "time": now, "type":7};
                                        mubChat.setReadonly();
                                        break;
                                case "leave":
                                        newMsg = {user: "SYS", type: 2, time: now, arg: position};
                                        break;
                                case "next":
                                        newMsg = {user: "SYS", type: 6, time: now};
                                        break;
                                case "initStep":
                                        newMsg = {user: "SYS", type: 5, time:now, arg:arg};
                                        break;
                                default:
                                        break;        
                        }
                        chat.alter("push", newMsg);
                        id = chat.getNbItems()-1;
                        mubChat.dom.querySelector("li[data-chat_id='"+id+"']").scrollIntoView();
                        
                        msg.push(newMsg);
                        chatCDB.set("msg", msg);
                        
                        chatCDB.upload()
                        .then(function(){
                                promise.fulfill();
                        });
                        
                        return promise;
                };
                
                mubChat.clear = function clear(){
                        chat.reset([]);
                };
                
                mubChat.reset = function reset(chatId){
                        var promise = new Promise();
                        position = "null";
                        mubChat.dom.querySelector(".chatwrite").classList.add("placeholder");
                        mubChat.dom.querySelector(".chatwrite").innerHTML = labels.get("typemsg");
                        chatCDB.unsync();
                        chatCDB.reset({});
                        chat.reset([]);
                        spinner.spin(mubChat.dom.querySelector("#chatspinner"));
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
                                                spinner.stop();
                                                promise.fulfill();       
                                        });        
                                }
                                
                                else{
                                        chat.reset(chatCDB.get("msg"));
                                        spinner.stop();
                                        promise.fulfill();
                                }      
                        });
                        return promise;
                };
                
                mubChat.joinChat = function joinChat(){
                        var promise = new Promise(),
                            arr = chatCDB.get("users"),
                            pos= arr.length,
                            now = new Date().getTime(),
                            msg = chatCDB.get("msg");
                        
                        // add new user to participant list
                        arr.push({"username": user.get("username"), "userid": user.get("_id")});
                        chatCDB.set("users", arr);
                        if (chatCDB.get("_id").search("_0")>-1){
                                msg.push({user: "SYS", time: now, type: 1, arg: pos});
                                chatCDB.set("msg", msg); 
                                chat.reset(msg);       
                        }
                        chatCDB.upload().then(function(){
                                position = pos;
                                promise.fulfill();
                        });
                        return promise;
                };
                
                mubChat.leave = function leave(){
                        var promise = new Promise(),
                            idx = null, i,
                            users = chatCDB.get("users");
                        mubChat.setMessage("leave")
                        .then(function(){
                                return chatCDB.upload();
                        })
                        .then(function(){
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
                        chatCDB.reset({});
                        chat.reset([]);
                };
                
                mubChat.getModel = function getModel(){
                        return chatCDB;
                };
                
                chatCDB.watchValue("msg", function(arrCDB){
                        var l = arrCDB.length - 1; 
                        chat.reset(arrCDB);
                        mubChat.dom.querySelector("li[data-chat_id='"+l+"']").scrollIntoView();    
                });
};
        
module.exports = function MUBChatFactory(){
        MUBChatConstructor.prototype = new Widget();
        return new MUBChatConstructor();        
};
