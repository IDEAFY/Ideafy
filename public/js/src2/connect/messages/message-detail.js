define("Ideafy/Connect/MessageDetail", ["Olives/OObject", "Config", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Ideafy/Avatar", "Ideafy/Utils", "Ideafy/Connect/MessageReply"],
        function(Widget, Config, Store, Model, Event, Avatar, Utils, Reply){
                
           return function MessageDetailConstructor($close){
           
                var msgDetailUI = new Widget(),
                    msgReplyUI = new Reply(),
                    message = new Store(),
                    cxrConfirm = new Store({"response":""}),
                    labels = Config.get("labels"),
                    user = Config.get("user"),
                    observer = Config.get("observer"),
                    transport = Config.get("transport");
                
                msgDetailUI.template = '<div id="msgdetail"><div class="header blue-dark"><span class="subjectlbl" data-label="bind:innerHTML, subjectlbl"></span><span data-message="bind:innerHTML, object"></span></div><div class = "detail-contents"><div class="detail-header"><div class="msgoptions"><div class="defaultmsgoption"><div name="reply" class="msgreply" data-messageevent="listen:touchstart, press; listen:touchend, action"></div><div name="more" class="more" data-messageevent="listen:touchstart, press; listen:touchend, action"></div></div><div class="msgoptionlist invisible"><div name="replyall" class="replyall sort-button" data-label="bind:innerHTML, replyalllbl" data-messageevent="listen:touchstart, press; listen:touchend, action"></div><div name="forward" class="forward sort-button" data-label="bind:innerHTML, forwardlbl" data-messageevent="listen:touchstart, press; listen:touchend, action"></div><div name="deletemsg" class="deletemsg sort-button" data-label="bind:innerHTML, deletelbl" data-messageevent="listen:touchstart, press; listen:touchend, action"></div></div></div><div data-message="bind:setAvatar, author"></div><p data-message="bind:innerHTML, username"></p><p class="toList"><span data-label="bind: innerHTML, tolbl"></span><span data-message="bind: innerHTML, toList"></span></p><p class="invisible" data-message="bind:showCcList, ccList" class="ccList"><span data-label="bind: innerHTML, tolbl"></span><span data-message="bind: innerHTML, ccList"></span></p><p><span class="date" data-message="bind: date, date"></span></p><br><span class="author"></span><span class="commentlbl" data-label="bind: setWrotelbl, doc.authornames"></span></div><div class="detail-body"><p data-message="bind:innerHTML, body" data-messageevent="listen:touchstart, showDoc"></p></div><div class="acceptrejectCXR invisible" data-message="bind:showCXRbtn, type"><div class="acceptCXR" data-label="bind:innerHTML, accept" data-messageevent="listen:touchstart, press; listen:touchend, acceptCXR"></div><div class="rejectCXR" data-label="bind:innerHTML, reject" data-messageevent="listen:touchstart, press; listen:touchend, rejectCXR"></div></div></div><div id="msgreply" class="invisible"></div><div id="CXRconfirm" class="invisible" data-cxr="bind:setVisibility, response"><span class="CXRconfirmed" data-cxr="bind:setResponseMessage, response"></span></div></div>';
                
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
                                showCcList : function(ccList){
                                        (ccList)?this.classList.remove("invisible"):this.classList.add("invisible");
                                },
                                showCXRbtn : function(type){
                                        if (type === "CXR") console.log(message.toJSON());
                                        (type === "CXR")?this.classList.remove("invisible"):this.classList.add("invisible");        
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
                        observer.notify("display-doc", message.get("docId"), message.get("docType"));
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
                        var arr = user.get("notifications"),
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
                        var contacts = user.get("connections"), pos = 0;
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
                        // upload and send notification to sender
                        user.upload().then(function(){
                                var now = new Date(), json = {
                                        "dest":[message.get("author")],
                                        "date" : [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()],
                                        "original":"",
                                        "type": "CXRaccept",
                                        "author": user.get("_id"),
                                        "username" : user.get("username"),
                                        "firstname" : user.get("firstname"),
                                        "toList": message.get("username"),
                                        "ccList": "",
                                        "object": user.get("username")+labels.get("acceptedCXR"),
                                        "body": "",
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
                                                }, 1500);
                                                
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
                
                //init
                msgDetailUI.reset = function reset(msg){
                        cxrConfirm.reset({"response":""});
                        message.reset(msg);
                        msgReplyUI.reset(msg, "reply");
                };
                
                
                return msgDetailUI;
            };      
        });
