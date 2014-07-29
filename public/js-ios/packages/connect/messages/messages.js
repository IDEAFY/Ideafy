/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define (["OObject", "service/map", "Bind.plugin", "Event.plugin", "Amy/Control-plugin", "Amy/Stack-plugin", "Store", "service/config", "service/avatar", "service/utils", "./message-detail", "./newmessage", "service/actionbar", "Promise"],
        function(Widget, Map, Model, Event, Control, Stack, Store, Config, Avatar, Utils, MessageDetail, NewMessage, ActionBar, Promise){
                
                return function MessagesConstructor(){
                        
                        var messageUI = new Widget(),
                            msgControl = new Control(messageUI),
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
                            currentBar,
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
                                                        case "INV":
                                                                this.innerHTML = msgList.get(id).username + labels.get("INVObject");
                                                                break;
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
                                                        case "REF":
                                                                this.innerHTML = msgList.get(id).username + labels.get("joinedideafy");
                                                                break;
                                                        case "MUD-":
                                                                this.innerHTML = labels.get("muinaday");
                                                                break;
                                                        case "MUQ-":
                                                                this.innerHTML = labels.get("mufifteen");
                                                                break;
                                                        case "MUP+":
                                                                this.innerHTML = labels.get("newpart");
                                                                break;
                                                        case "MUP-":
                                                                this.innerHTML = labels.get("partleft");
                                                                break;
                                                        case "SCANCEL":
                                                                this.innerHTML = labels.get("scancel");
                                                                break;
                                                        case "SSTART":
                                                                this.innerHTML = labels.get("sstart");
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
                                                (status && status === "unread") ? this.classList.add("unread"):this.classList.remove("unread");
                                        },
                                        setAvatar : function setAvatar(author){
                                                var _frag, _ui;
                                                if (author){
                                                        _frag = document.createDocumentFragment();
                                                        _ui = new Avatar([author]);
                                                        _ui.place(_frag);
                                                        (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                                }
                                        }
                                }),
                                "msglistevent" : new Event(messageUI),
                                "msglistcontrol" : msgControl,
                                "msgdetailstack" : detailStack
                        });
                        
                        messageUI.template = '<div id="connect-messages"><div class="messages"><div class="header blue-light"><span data-label="bind: innerHTML, msglistheadertitle">My Messages</span><div class="option right" data-msglistevent="listen: touchstart, plus"></div></div><ul class="selectors" data-sort = "foreach"><li class="sort-button" data-sort="bind: setLabel, label; bind:setSelected, selected, bind: name, name" data-msglistevent="listen:touchstart, displaySort"></li></ul><input class="search" type="text" data-label="bind: placeholder, searchmsgplaceholder" data-msglistevent="listen: keypress, search"><div class="msglist overflow" data-msglistcontrol="radio:li,selected,touchend,selectMsg"><ul data-msg="foreach"><li class="msg list-item" data-msglistevent="listen:touchstart, setStart; listen:touchmove, showActionBar"><div data-msg="bind:setAvatar, author"></div><p class="msg-author unread" data-msg="bind:highlight, status; bind:innerHTML, username">Author</p><div class="select-msg"></div><span class="date" data-msg="bind: date, date"></span><p class="msg-subject unread" data-msg="bind:highlight, status; bind:setObject, type">Subject</p></li></ul></div></div><div id="msg-detail" class="details" data-msgdetailstack="destination"></div></div>';
                        
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
                               if (msgList.get(id).status === "unread"){
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
                                }
                                
                                // display message detail
                                detailStack.getStack().show("#msgdetail");
                                messageDetail.reset(msgList.get(id));
                                previousScreen = "#msgdetail";
                                      
                        };
                        
                        messageUI.init = function init(){
                                msgList.reset(user.get("notifications"));
                                messageUI.cleanOld();
                        };
                        
                        messageUI.reset = function reset(){
                                sortButtons.reset([
                                    {"name": "all", "label": "allbtn", "selected": true},
                                    {"name": "messages", "label": "msgbtn", "selected": false},
                                    {"name": "notifications", "label": "notifbtn", "selected": false},
                                    {"name": "unread", "label": "unreadbtn", "selected": false}
                                ]);
                                messageUI.init();
                                // show default page
                                detailStack.getStack().show("#defaultPage");
                                // reset action bar display status
                                currentBar && currentBar.hide();    
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
                                                promise.fulfill();
                                        });
                                }
                                else promise.fulfill();
                                
                                return promise;                
                        };
                        
                        // Action bar
                        messageUI.setStart = function(event, node){
                                touchStart = [event.pageX, event.pageY];
                                if (currentBar){
                                        currentBar.hide();
                                        currentBar = null;        
                                } 
                        };
                
                        messageUI.showActionBar = function(event, node){
                                var id = node.getAttribute("data-msg_id"),
                                    frag, display = false;
                        
                                touchPoint = [event.pageX, event.pageY];
                                
                                // check if actionbar exists for this element
                                if (currentBar && currentBar.getParent() === node){
                                        display = true;
                                }
                        
                                if (!display && (touchStart[0]-touchPoint[0]) > 40 && (touchPoint[1]-touchStart[1])<20 && (touchPoint[1]-touchStart[1])>-20){
                                        currentBar = new ActionBar("message", node, msgList.get(id)._id);
                                        frag = document.createDocumentFragment();  
                                        currentBar.place(frag); // render action bar    
                                        node.appendChild(frag); // display action bar
                                }
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
                                
                                msgList.reset([]);
                                
                                newList = sortMessages(currentSort);
                                msgList.reset(newList);
                                
                                if (detailStack.getStack().getCurrentName() === "#msgdetail"){
                                        id = messageUI.getSelectedmsg();
                                        (id>-1) ? messageDetail.reset(msgList.get(id)): detailStack.getStack().show("#defaultPage");
                                } 
                        });
                        
                        observer.watch("display-message", function(id){
                                var arr = user.get("notifications");
                                
                                // check if message is of type message or notification
                                sortButtons.update(currentSort, "selected", false);
                                if (arr[id].type === "MSG"){
                                        sortButtons.update(1, "selected", true);
                                        currentSort = 1;        
                                }
                                else{
                                        sortButtons.update(2, "selected", true);
                                        currentSort = 2;        
                                }
                                
                                // change message status to read
                                arr[id].status = "read";
                                user.set("notifications", arr);
                                user.upload();
                                
                                // display message
                                msgList.reset([arr[id]]);
                                // add "selected" class
                                document.querySelector('li[data-msg_id="0"]').classList.add("selected");
                                msgControl.init(document.querySelector('li[data-msg_id="0"]'));
                                
                                // display message detail
                                detailStack.getStack().show("#msgdetail");
                                messageDetail.reset(arr[id]);
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
                                    {"name": "all", "label": "allbtn", "selected": true},
                                    {"name": "messages", "label": "msgbtn", "selected": false},
                                    {"name": "notifications", "label": "notifbtn", "selected": false},
                                    {"name": "unread", "label": "unreadbtn", "selected": false}
                            ]);
                                sortButtons.update(current, "selected", true);
                        });
                        
                        return messageUI;
                };
        });
