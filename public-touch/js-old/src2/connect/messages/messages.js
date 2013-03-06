/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define ("Ideafy/Connect/Messages", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Amy/Control-plugin", "Amy/Stack-plugin", "Store", "Config", "Ideafy/Avatar", "Ideafy/Utils", "Ideafy/Connect/MessageDetail", "Ideafy/Connect/NewMessage", "Ideafy/ActionBar", "Promise"],
        function(Widget, Map, Model, Event, Control, Stack, Store, Config, Avatar, Utils, MessageDetail, NewMessage, ActionBar, Promise){
                
                return function MessagesConstructor(){
                        
                        var messageUI = new Widget(),
                            detailStack = new Stack(),
                            close = function (screen){
                                    detailStack.getStack().show(screen);
                            },
                            previousScreen = "#defaultPage",
                            defaultPage = new Widget(), // to show in detail space when no message is selected
                            messageDetail = new MessageDetail(close),
                            newMessage = new NewMessage(close),
                            sortButtons = new Store([
                                    {"name": "all", "label": "allbtn", "selected": true},
                                    {"name": "messages", "label": "msgbtn", "selected": false},
                                    {"name": "notifications", "label": "notifbtn", "selected": false},
                                    {"name": "unread", "label": "unreadbtn", "selected": false}
                            ]),
                            currentSort = 0,
                            msgList = new Store([]),
                            labels = Config.get("labels"),
                            touchStart,
                            touchPoint,
                            display = false,
                            user = Config.get("user"),
                            observer = Config.get("observer"),
                            sortMessages = function(id){
                                    var type = sortButtons.get(id).name,
                                        msgs = user.get("notifications"),
                                        i, l = msgs.length,
                                        result = [];
                                    
                                    switch (type){
                                            case "messages":
                                                for (i=0; i<l;i++){
                                                        if (msgs[i].type === "MSG") result.push(msgs[i]);
                                                }
                                                break;
                                            case "notifications":
                                                for (i=0; i<l;i++){
                                                        if (msgs[i].type !== "MSG") result.push(msgs[i]);
                                                }
                                                break;
                                            case "unread":
                                            for (i=0; i<l;i++){
                                                        if (msgs[i].status === "unread") result.push(msgs[i]);
                                                }
                                                break;
                                            default:
                                                result = msgs;
                                    }
                                    return result;
                            },
                            searchMessages = function(text){
                                var msgs = [], result = [];
                                msgs = user.get("notifications").concat();
                                
                                if (text === ""){
                                        result = msgs;
                                        sortButtons.update(0, "selected", true);
                                        currentSort = 0;
                                }
                                else{
                                        for (i=0, l=msgs.length; i<l;i++){
                                                if(JSON.stringify(msgs[i]).toLowerCase().search(text.toLowerCase()) > -1) result.push(msgs[i]);
                                        }
                                }
                                return result;         
                            };
                        
                        messageUI.plugins.addAll({
                                "label": new Model(labels),
                                "sort" : new Model(sortButtons, {
                                        "setLabel" : function(name){
                                                this.innerHTML = labels.get(name);
                                        },
                                        "setSelected" : function(selected){
                                                (selected)?this.classList.add("pressed"):this.classList.remove("pressed");
                                        }
                                }),
                                "msg" : new Model(msgList,{
                                        setObject : function(type){
                                                var id = this.getAttribute("data-msg_id");
                                                switch(type){
                                                        case "CXR":
                                                                this.innerHTML = msgList.get(id).username + labels.get("CXRobject");
                                                                break;
                                                        case "CXRaccept":
                                                                this.innerHTML = msgList.get(id).username + labels.get("acceptedCXR");
                                                                break;
                                                        case "CXRreject":
                                                                this.innerHTML = msgList.get(id).username + labels.get("rejectedCXR");
                                                                break;
                                                        case "CXCancel":
                                                                this.innerHTML = msgList.get(id).username + labels.get("canceledCX");
                                                                break;
                                                        case "DOC":
                                                                this.innerHTML = msgList.get(id).username + labels.get("sentdocmsg");
                                                                break;
                                                        case "2Q+":
                                                                this.innerHTML = msgList.get(id).username + labels.get("askednew");
                                                                break;
                                                        case "2C+":
                                                                this.innerHTML = msgList.get(id).username + labels.get("senttc");
                                                                break;
                                                        default :
                                                                this.innerHTML = msgList.get(id).object;
                                                }        
                                        },
                                        date : function date(date){
                                                var now = new Date();
                                                if (date && date[0] === now.getFullYear() && date[1] === now.getMonth() && date[2] === now.getDate()){
                                                        var hrs = date[3],
                                                            min = date[4],
                                                            sec = date[5];
                                                        if (hrs<10) {hrs = "0" + hrs;}
                                                        if (min<10) {min = "0" + min;}
                                                        if (sec<10) {sec = "0" + sec;}
                                                        this.innerHTML = hrs+":"+min+":"+sec;
                                                }
                                                else {
                                                        this.innerHTML = Utils.formatDate(date);
                                                }
                                        },
                                        highlight: function(status){
                                                (status === "unread") ? this.classList.add("unread"):this.classList.remove("unread");
                                        },
                                        setAvatar : function setAvatar(author){
                                                var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar([author]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        }
                                }),
                                "msglistevent" : new Event(messageUI),
                                "msglistcontrol" : new Control(messageUI),
                                "msgdetailstack" : detailStack
                        });
                        
                        messageUI.template = '<div id="connect-messages"><div class="messages list"><div class="header blue-light"><span data-label="bind: innerHTML, msglistheadertitle">My Messages</span><div class="option right" data-msglistevent="listen: touchstart, plus"></div></div><ul class="selectors" data-sort = "foreach"><li class="sort-button" data-sort="bind: setLabel, label; bind:setSelected, selected, bind: name, name" data-msglistevent="listen:touchstart, displaySort"></li></ul><input class="search" type="text" data-label="bind: placeholder, searchmsgplaceholder" data-msglistevent="listen: keypress, search"><div class="msglist overflow" data-msglistcontrol="radio:li,selected,touchend,selectMsg"><ul data-msg="foreach"><li class="msg list-item" data-msglistevent="listen:touchstart, setStart; listen:touchmove, showActionBar"><div data-msg="bind:setAvatar, author"></div><p class="msg-author unread" data-msg="bind:highlight, status; bind:innerHTML, username">Author</p><div class="select-msg"></div><span class="date" data-msg="bind: date, date"></span><p class="msg-subject unread" data-msg="bind:highlight, status; bind:setObject, type">Subject</p></li></ul></div></div><div id="msg-detail" class="details" data-msgdetailstack="destination"></div></div>';
                        
                        messageUI.place(Map.get("connect-messages"));
                        
                        messageUI.plus = function plus(event, node){
                                detailStack.getStack().get("#newmsg").reset();
                                detailStack.getStack().show("#newmsg");      
                        };
                        
                        messageUI.displaySort = function(event, node){
                                var id = node.getAttribute("data-sort_id");
                                // reset list selection
                                msgList.reset([]);
                                // show default page
                                detailStack.getStack().show("#defaultPage");
                                // cancel current sort
                                if (currentSort >-1) sortButtons.update(currentSort, "selected", false);
                                // perform sorting
                                sortButtons.update(id, "selected", true);
                                currentSort = id;
                                // display sorted list
                                 msgList.reset(sortMessages(id));
                        };
                        
                        messageUI.search = function(event, node){
                                if (event.keyCode === 13){
                                        sortButtons.update(currentSort, "selected", false);
                                        currentSort = -1;
                                        msgList.reset(searchMessages(node.value));             
                                } 
                        };
                        
                        messageUI.selectMsg = function selectMsg(event, node){
                                var id = event.target.getAttribute("data-msg_id"),
                                    arr = user.get("notifications"),
                                    idx;
                                
                                // change message status to read
                                // first need to retrieve message in user notifications
                                for (i=0, l=arr.length; i<l;i++){
                                        if (JSON.stringify(arr[i]) === JSON.stringify(msgList.get(id))) {
                                                index = i;
                                                break;
                                        }
                                }
                                msgList.update(id, "status", "read");
                                arr[index]=msgList.get(id);
                                user.set("notifications", arr);
                                user.upload();
                                
                                // display message detail
                                detailStack.getStack().show("#msgdetail");
                                messageDetail.reset(msgList.get(id));
                                previousScreen = "#msgdetail";
                                      
                        };
                        
                        messageUI.init = function init(){
                                messageUI.cleanOld().then(function(){
                                        msgList.reset(user.get("notifications"));
                                });
                        };
                        
                        messageUI.getSelectedmsg = function(){
                                var node = document.querySelector(".msg.selected"), id = -1;
                                if (node) id = node.getAttribute("data-msg_id");
                                return id;
                        };
                       
                        //delete messages older than 30 days
                        messageUI.cleanOld = function(){
                                var promise = new Promise(),
                                    now = new Date(),
                                    msgdate, sentdate,
                                    update = false,
                                    n = user.get("notifications") || [],
                                    s = user.get("sentMessages") || [];
                                
                                for (i=n.length-1;i>=0;i--){
                                        msgdate = new Date(n[i].date[0], n[i].date[1], n[i].date[2], n[i].date[3], n[i].date[4], n[i].date[5]);
                                        if ((now.getTime()-msgdate.getTime()) > 2592000000) {
                                                n.pop();
                                                update = true;
                                        }   
                                }
                                for (i=s.length-1;i>=0;i--){
                                        sentdate = new Date(s[i].date[0], s[i].date[1], s[i].date[2], s[i].date[3], s[i].date[4], s[i].date[5]);
                                        if ((now.getTime()-sentdate.getTime()) > 2592000000) {
                                                s.pop();
                                                update = true;
                                        }      
                                }
                                if (update){
                                        user.set("notifications", n);
                                        user.set("sentMessages", s);
                                
                                        user.upload().then(function(){
                                                promise.resolve();
                                        });
                                }
                                else promise.resolve();
                                
                                return promise;                
                        };
                        
                        // Action bar
                        messageUI.setStart = function(event, node){
                                touchStart = [event.pageX, event.pageY];
                                if (document.querySelector(".actionbar")) messageUI.hideActionBar();  // hide previous action bar 
                        };
                
                        messageUI.showActionBar = function(event, node){
                                var id = node.getAttribute("data-msg_id");
                                touchPoint = [event.pageX, event.pageY];
                                if (!display && (touchStart[0]-touchPoint[0]) > 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                        var actionBar = new ActionBar("message", node, msgList.get(id), messageUI.hideActionBar),
                                           frag = document.createDocumentFragment();  
                                
                                        actionBar.place(frag); // render action bar
                                        node.appendChild(frag); // display action bar
                                        display = true; // prevent from showing it multiple times
                                }
                        };
                
                        messageUI.hideActionBar = function hideActionBar(){
                                var ui = document.querySelector(".actionbar"),
                                    parent = ui.parentNode;
                                parent.removeChild(parent.lastChild);
                                display = false;
                        };
                        
                        defaultPage.template = '<div class="msgsplash"><div class="header blue-dark"><span>'+Config.get("labels").get("messageview")+'</span></div><div class="innersplash" data-labels="bind: innerHTML, messagecenter"></div></div>';
                        
                        defaultPage.plugins.add("labels", new Model(labels));
                       
                        // initialize
                        // get message list from user document
                        messageUI.init();
                        // add UIs to detail stack
                        detailStack.getStack().add("#defaultPage", defaultPage);
                        detailStack.getStack().add("#msgdetail", messageDetail);
                        detailStack.getStack().add("#newmsg", newMessage);
                        // show default page
                        detailStack.getStack().show("#defaultPage");
                        
                        // watch for changes in notifications
                        user.watchValue("notifications", function(){
                                var id, newList = [];
                                // if no search is active
                                if (currentSort>-1) {
                                        newList = sortMessages(currentSort);
                                        msgList.reset(newList);
                                }
                                if (detailStack.getStack().getCurrentName === "#msgdetail"){
                                        id = messageUI.getSelectedmsg();
                                        (id>-1)? messageDetail.reset(msgList.get(id)): detailStack.getStack().show("#defaultPage");
                                } 
                        });
                        
                        observer.watch("display-message", function(id){
                                var arr = user.get("notifications"), message = arr[id];
                                
                                // check if message is of type message or notification
                                sortButtons.update(currentSort, "selected", false);
                                if (message.type === "MSG"){
                                        sortButtons.update(1, "selected", true);
                                        currentSort = 1;        
                                }
                                else{
                                        sortButtons.update(2, "selected", true);
                                        currentSort = 2;        
                                }
                                
                                // change message status to read
                                message.status = "read";
                                arr[id] = message;
                                user.set("notifications", arr);
                                user.upload();
                                
                                // display message
                                msgList.reset([message]);
                                // add "selected" class
                                document.querySelector('li[data-msg_id="0"]').classList.add("selected");
                                
                                // display message detail
                                detailStack.getStack().show("#msgdetail");
                                messageDetail.reset(message);
                                previousScreen = "#msgdetail";        
                                        
                        });
                        
                        observer.watch("message-contact", function(data){
                                newMessage.reset(data);
                                detailStack.getStack().show("#newmsg");
                        });
                        
                        // watch for language change
                        user.watchValue("lang", function(){
                                var current;
                                sortButtons.loop(function(v,i){
                                        if (v.selected) current = i;        
                                });
                                sortButtons.reset([
                                    {"name": "all", "label": "allbtn", "selected": false},
                                    {"name": "messages", "label": "msgbtn", "selected": false},
                                    {"name": "notifications", "label": "notifbtn", "selected": false},
                                    {"name": "unread", "label": "unreadbtn", "selected": false}
                            ]);
                                sortButtons.update(current, "selected", true);
                        });
                        
                        return messageUI;
                };
        });
