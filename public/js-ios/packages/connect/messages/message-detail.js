/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Store", "CouchDBDocument", "Bind.plugin", "Event.plugin", "service/avatar", "service/utils", "./message-reply"],
        function(Widget, Config, Store, CouchDBDocument, Model, Event, Avatar, Utils, Reply){
                
           return function MessageDetailConstructor($close){
           
                var msgDetailUI = new Widget(),
                    msgReplyUI = new Reply(),
                    message = new Store(),
                    cxrConfirm = new Store({"response":""}),
                    labels = Config.get("labels"),
                    user = Config.get("user"),
                    observer = Config.get("observer"),
                    transport = Config.get("transport");
                
                msgDetailUI.template = '<div id="msgdetail"><div class="header blue-dark"><span class="subjectlbl" data-label="bind:innerHTML, subjectlbl"></span><span data-message="bind:setObject, type"></span></div><div class="msgdetailarea"><div class = "detail-contents"><div class="detail-header"><div class="msgoptions" data-message="bind: showOptions, type"><div class="defaultmsgoption"><div name="reply" class="msgreply" data-messageevent="listen:touchstart, press; listen:touchend, action"></div><div name="more" class="more" data-messageevent="listen:touchstart, press; listen:touchend, action"></div></div><div class="msgoptionlist invisible"><div name="replyall" class="replyall sort-button" data-label="bind:innerHTML, replyalllbl" data-messageevent="listen:touchstart, press; listen:touchend, action"></div><div name="forward" class="forward sort-button" data-label="bind:innerHTML, forwardlbl" data-messageevent="listen:touchstart, press; listen:touchend, action"></div><div name="deletemsg" class="deletemsg sort-button" data-label="bind:innerHTML, deletelbl" data-messageevent="listen:touchstart, press; listen:touchend, action"></div></div></div><div data-message="bind:setAvatar, author"></div><p data-message="bind:innerHTML, username"></p><p class="toList"><span data-label="bind: innerHTML, tolbl"></span><span data-message="bind: setToList, toList"></span></p><p class="toList invisible" data-message="bind:showCcList, ccList"><span data-label="bind: innerHTML, cclbl"></span><span data-message="bind: innerHTML, ccList"></span></p><p class="msgdate"><span class="date" data-message="bind: date, date"></span></p></div><div class="detail-body"><p data-message="bind:setBody, type"></p><p data-message="bind:setSignature, type"></p><p class="invisible" data-message="bind:setJoinMsg, sessionStatus"></p><div class="showdoc" data-message="bind: showDocBtn, type" data-messageevent="listen:touchstart, press; listen:touchend, showDoc"></div><div class="gotosession invisible" data-message="bind: showSessionBtn, sessionStatus" data-messageevent="listen:touchstart, press; listen:touchend, gotoSession"></div><div class="goto2q invisible" data-message = "bind: showTwoQ, type" data-messageevent="listen: touchstart, press; listen: touchend, showTwoQ"></div><div class="acceptrejectCXR invisible" data-message="bind:showCXRbtn, type"><div class="acceptCXR" data-label="bind:innerHTML, accept" data-messageevent="listen:touchstart, press; listen:touchend, acceptCXR"></div><div class="rejectCXR" data-label="bind:innerHTML, reject" data-messageevent="listen:touchstart, press; listen:touchend, rejectCXR"></div></div></div></div><div id="msgreply" class="invisible"></div><div id="CXRconfirm" class="invisible" data-cxr="bind:setVisibility, response"><span class="CXRconfirmed" data-cxr="bind:setResponseMessage, response"></span></div></div></div>';
                
                msgDetailUI.plugins.addAll({
                        "label": new Model(labels),
                        "message": new Model(message,{
                                date : function date(date){
                                        var now = new Date(), hrs = date[3], min = date[4], sec = date[5];
                                        if (date && date[0] === now.getFullYear() && date[1] === now.getMonth() && date[2] === now.getDate()){
                                                if (hrs<10) {hrs = "0" + hrs;}
                                                if (min<10) {min = "0" + min;}
                                                if (sec<10) {sec = "0" + sec;}
                                                this.innerHTML = hrs+":"+min+":"+sec;
                                        }
                                        else {
                                                this.innerHTML = Utils.formatDate(date)+ "  "+hrs+":"+min;
                                        }
                                },
                                setObject : function(type){
                                        switch(type){
                                                case "CXR":
                                                        this.innerHTML = message.get("username") + labels.get("CXRobject");
                                                        break;
                                                case "INV":
                                                        this.innerHTML = message.get("username") + labels.get("INVObject");
                                                        break;
                                                case "CXRaccept":
                                                        this.innerHTML = message.get("username") + labels.get("acceptedCXR");
                                                        break;
                                                case "CXRreject":
                                                        this.innerHTML = message.get("username") + labels.get("rejectedCXR");
                                                        break;
                                                case "CXCancel":
                                                        this.innerHTML = message.get("username") + labels.get("canceledCX");
                                                        break;
                                                case "DOC":
                                                        this.innerHTML = message.get("username") + labels.get("sentdocmsg");
                                                        break;
                                                case "2Q+":
                                                        this.innerHTML = message.get("username") + labels.get("askednew");
                                                        break;
                                                case "2C+":
                                                        this.innerHTML = message.get("username") + labels.get("senttc");
                                                        break;
                                                case "REF":
                                                        this.innerHTML = messages.get(id).username + labels.get("joinedideafy");
                                                        break;
                                                default :
                                                        this.innerHTML = message.get("object");
                                        }        
                                },
                                setBody : function(type){
                                        switch(type){
                                                case "CXRaccept":
                                                        this.innerHTML = labels.get("youlbl") + labels.get("nowconnected") + message.get("username");
                                                        break;
                                                case "DOC":
                                                        // TBD --> maybe include the doc title
                                                        this.innerHTML = "<p>" + message.get("body") + "</p><p>"+ message.get("username") + "</p><p>" + message.get("signature") + "</p><br><br><p>" + labels.get("clicktoview") + " : <b>" + message.get("docTitle")+"</b></p>";
                                                        break;
                                                case "INV":
                                                        this.innerHTML = message.get("username") + labels.get("INVObject") + " : <b>" + message.get("docTitle")+"</b>";
                                                        break;
                                                case "REF":
                                                        this.innerHTML = labels.get("referral");
                                                        break;
                                                default :
                                                        this.innerHTML = message.get("body").replace(/\n/g, "<br>");
                                                        break;
                                        }           
                                },
                                setSignature : function(type){
                                        if (type === "MSG"){
                                                this.classList.remove("invisible");
                                                this.innerHTML = message.get("signature");
                                        }
                                        else {this.classList.add("invisible");}
                                },
                                showOptions : function(type){
                                        ((type.search("CX")>-1) || (type === "2Q+") || (type === "INV")) ? this.classList.add("invisible") : this.classList.remove("invisible");        
                                },
                                setToList : function(toList){
                                        (toList) ? this.innerHTML = toList : this.innerHTML = labels.get("melbl");        
                                },
                                showCcList : function(ccList){
                                        (ccList)?this.classList.remove("invisible"):this.classList.add("invisible");
                                },
                                showCXRbtn : function(type){
                                        (type === "CXR")?this.classList.remove("invisible"):this.classList.add("invisible");        
                                },
                                showDocBtn : function(type){
                                        (type === "DOC")?this.classList.remove("invisible"):this.classList.add("invisible");        
                                },
                                showSessionBtn : function(sessionStatus){
                                        (sessionStatus && sessionStatus === "waiting" && !message.get("joined"))?this.classList.remove("invisible"):this.classList.add("invisible");   
                                },
                                setJoinMsg : function(sessionStatus){
                                        if (!sessionStatus) {this.classList.add("invisible");}
                                        else {
                                                this.classList.remove("invisible");
                                                if (sessionStatus === "unavailable"){
                                                        this.innerHTML = labels.get("nolongerjoin");
                                                }
                                                else if (sessionStatus === "joined"){
                                                        this.innerHTML = labels.get("joinedsession");
                                                }
                                                else if (sessionStatus === "waiting"){
                                                        this.innerHTML = labels.get("clicktojoin");
                                                }
                                        }
                                },
                                showTwoQ : function(type){
                                        (type === "2Q+" || type === "2C+") ? this.classList.remove("invisible"):this.classList.add("invisible");        
                                },
                                setAvatar : function setAvatar(author){
                                                var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar([author]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                }
                        }),
                        "cxr": new Model(cxrConfirm,{
                                setVisibility : function(resp){
                                        (resp)?this.classList.remove("invisible"):this.classList.add("invisible")
                                },
                                setResponseMessage : function(resp){
                                        (resp === "YES")?this.innerHTML = labels.get("CXRaccepted")+message.get("username")+labels.get("isnowacontact"): this.innerHTML = labels.get("CXRrejected");
                                }
                        }),
                        "messageevent": new Event(msgDetailUI)
                });
                
                msgDetailUI.showDoc = function showDoc(event, node){
                        node.classList.remove("pushed");
                        if (message.get("type") === "DOC") {
                                observer.notify("display-doc", message.get("docId"), message.get("docType"));
                        }
                };
                
                msgDetailUI.showTwoQ = function showTwoQ(event, node){
                        node.classList.remove("pushed");
                        if (message.get("type") === "2Q+") {
                                observer.notify("display-twoq", message.get("docId"), message.get("author"));
                        }
                        if (message.get("type") === "2C+") {
                                observer.notify("display-twoc");
                        }       
                };
                
                msgDetailUI.press = function(event, node){
                        node.classList.add("pushed");        
                };
                
                msgDetailUI.action = function(event, node){
                        var name = node.getAttribute("name"),
                            replyNode = document.getElementById("msgreply"),
                            options = document.querySelector(".msgoptionlist");
                        
                        switch(name){
                                case "more":
                                        options.classList.remove("invisible");
                                        break;
                                case "reply":
                                        options.classList.add("invisible");
                                        msgReplyUI.reset(JSON.parse(message.toJSON()), "reply");
                                        replyNode.classList.remove("invisible"); 
                                        break;
                                case "replyall":
                                        options.classList.add("invisible");
                                        msgReplyUI.reset(JSON.parse(message.toJSON()), "replyall");
                                        replyNode.classList.remove("invisible"); 
                                        break;
                                case "forward":
                                        options.classList.add("invisible");
                                        msgReplyUI.reset(JSON.parse(message.toJSON()), "forward");
                                        replyNode.classList.remove("invisible"); 
                                        break;
                                case "deletemsg":
                                        options.classList.add("invisible");
                                        msgDetailUI.deletemsg(message.toJSON());
                                        $close("#defaultPage");
                                        break;
                                default:
                                        break;
                        }
                        node.classList.remove("pushed");        
                };
                
                msgDetailUI.deletemsg = function deletemsg(msg){
                        var arr = user.get("notifications").concat(),
                            index;
                        
                        for (i=0, l=arr.length; i<l; i++){
                                if (JSON.stringify(arr[i]) === msg){
                                        index = i;
                                        break;
                                }
                        }
                        arr.splice(index, 1);
                        user.set("notifications", arr);
                        user.upload();
                };
                
                msgDetailUI.acceptCXR = function(event, node){
                        var contacts = user.get("connections"), news = user.get("news")|| [], pos = 0, now = new Date(), date=[now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
                        node.classList.remove("pushed");
                        // add contact info to user's connections -- insert in proper alphabetical position of last name
                        for (i=0,l=contacts.length;i<l;i++){
                                // check if contact is of type user or group first
                                if (contacts[i].type === "user"){
                                        if (contacts[i].lastname < message.get("contactInfo").lastname) pos++; 
                                        if (contacts[i].lastname === message.get("contactInfo").lastname){
                                                if (contacts[i].firstname < message.get("contactInfo").firstname) pos++; 
                                        }
                                }
                                else if (contacts[i].username < message.get("contactInfo").lastname)  pos++;   
                        }
                        contacts.splice(pos, 0, message.get("contactInfo"));
                        user.set("connections", contacts);
                        // add new connection to news
                        
                        news.unshift({"type": "CX+", date: date, "content": {userid:message.get("author"), username:message.get("username")}});
                        user.set("news", news);
                        // upload and send notification to sender
                        user.upload().then(function(){
                                var json = {
                                        "dest":[message.get("author")],
                                        "date" : date,
                                        "original":"",
                                        "type": "CXRaccept",
                                        "author": user.get("_id"),
                                        "username" : user.get("username"),
                                        "firstname" : user.get("firstname"),
                                        "toList": message.get("username"),
                                        "ccList": "",
                                        "object": user.get("username")+labels.get("acceptedCXR"),
                                        "body": labels.get("youlbl") + labels.get("nowconnected") + user.get("username"),
                                        "signature": "",
                                        "contactInfo": { 
                                                "firstname": user.get("firstname"),
                                                "lastname": user.get("lastname"),
                                                "userid": user.get("_id"),
                                                "username": user.get("username"),
                                                "intro": user.get("intro"), 
                                                "type":"user"
                                        }
                                };
                                cxrConfirm.set("response", "YES");
                                //send response
                                transport.request("Notify", json, function(result){
                                        if (JSON.parse(result)[0].res === "ok"){
                                                // delete this message, confirmation popup, return to default page
                                                setTimeout(function(){
                                                        msgDetailUI.deletemsg(message.toJSON());
                                                        $close("#defaultPage");
                                                }, 1000);
                                                
                                        }
                                });
                                       
                        });
                };
                
                msgDetailUI.rejectCXR = function(event, node){
                        var json, now=new Date();
                        node.classList.remove("pushed");
                        cxrConfirm.set("response", "NO");
                        //notify sender of rejection
                        json = {
                                "dest":[message.get("author")],
                                "original": "",
                                "date" : [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()],
                                "type": "CXRreject",
                                "author": user.get("_id"),
                                "username" : user.get("username"),
                                "firstname" : user.get("firstname"),
                                "toList": message.get("username"),
                                "ccList": "",
                                "object": user.get("username")+labels.get("rejectedCXR"),
                                "body": "",
                                "signature": ""
                      };
                      //send response
                        transport.request("Notify", json, function(result){
                                if (JSON.parse(result)[0].res === "ok"){
                                        // delete this message, confirmation popup, return to default page
                                        setTimeout(function(){
                                                msgDetailUI.deletemsg(message.toJSON());
                                                $close("#defaultPage");
                                        }, 1500);
                                                
                                }
                        });
                              
                };
                
                // a function to check the status of a multi-user session user has been invited to
                msgDetailUI.checkSessionStatus = function checkSessionStatus(sid){
                        var cdb = new CouchDBDocument();
                        cdb.setTransport(transport);
                        cdb.sync(Config.get("db"), sid).then(function(){
                                if (cdb.get("status") === "waiting"){
                                        message.set("sessionStatus", "waiting");
                                }
                                else{message.set("sessionStatus", "unavailable");}
                                cdb.unsync();
                         }, function(error){alert(error);});       
                };
                
                msgDetailUI.gotoSession = function(event, node){
                        var arr = user.get("notifications");
                        node.classList.remove("pushed");
                        message.set("joined", true);
                        Config.get("observer").notify("join-musession", message.get("docId"));
                        
                        // can only join a session once
                        for (i=0, l=arr.length; i<l; i++){
                                if (arr[i].type === "INV" && arr[i].docId === message.get("docId")){
                                        arr[i].joined = true;
                                        break;
                                }
                        }
                        user.set("notifications", arr);
                        user.upload();               
                };
                
                //init
                msgDetailUI.reset = function reset(msg){
                        message.reset({});
                        cxrConfirm.reset({"response":""});
                        message.reset(msg);
                        msgReplyUI.reset(msg, "reply");
                        // check if message type is a session invite and if so check session status
                        if (message.get("type") === "INV"){
                                if (message.get("joined")){
                                        message.set("joined", true);
                                }
                                else{
                                        message.set("sessionStatus", null);
                                        msgDetailUI.checkSessionStatus(message.get("docId"));
                                }
                        }
                };
                
                return msgDetailUI;
            };      
        });
