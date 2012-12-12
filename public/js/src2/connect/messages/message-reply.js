define("Ideafy/Connect/MessageReply", ["Olives/OObject", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Ideafy/Utils", "Promise"],
        function(Widget, Store, Model, Event, Config, Utils, Promise){
                
           return function MessageReplyConstructor(){
           
                var messageReplyUI = new Widget(),
                    msgReply = new Store(),
                    error = new Store({"errormsg":""}),
                    labels = Config.get("labels"),
                    user = Config.get("user"),
                    transport = Config.get("transport"),
                    sendInProgress = false,
                    cleanBody = function(body){
                        // pattern to remove html tags from body
                        var pattern = /<(.|\n)*?>/g;
                        return body.replace(pattern,"");        
                    },
                    validateRecipients = function(onEnd){
                        var to = msgReply.get("toList").toLowerCase().split(/,|;/),
                            cc = msgReply.get("ccList").toLowerCase().split(/,|;/),
                            contacts = JSON.stringify(user.get("connections")).toLowerCase(),
                            dest = [],
                            json = {},
                            promise = new Promise();
                        // reset recipient list
                        arr = [];    
                        // check recipients
                        for (i=0, l=to.length; i<l; i++){
                                if (contacts.search(to[i].trim()) > -1){
                                        dest.push(to[i].trim());
                                }
                                else{
                                        error.set("errormsg", labels.get("tolbl")+" : "+to[i].trim()+labels.get("notavalidcontact"));
                                        sendInProgress = false;
                                        promise.reject();
                                        break;
                                }       
                        }
                        // check cc
                        if (!error.get("errormsg") && cc[0] !== ""){
                                for (i=0, l=cc.length; i<l; i++){
                                        if (contacts.search(cc[i].trim()) > -1){
                                                dest.push(cc[i].trim()); 
                                        }
                                        else{
                                                error.set("errormsg", labels.get("tolbl")+" : "+cc[i].trim()+labels.get("notavalidcontact"));
                                                sendInProgress = false;
                                                promise.reject();
                                                break;
                                        }      
                                        }
                        }
                        //obtain userids from usernames
                        if (!error.get("errormsg")){
                                json.list = dest;
                                transport.request("CheckRecipientList", json, function(result){
                                        var arr = [];
                                        if (!result.error){
                                                for (i=0, l=result.length; i<l; i++){
                                                        arr.push(result[i].value);
                                                }
                                                onEnd(arr);
                                                promise.resolve();
                                        }
                                        else {
                                                error.set("errormsg", result.error);
                                                promise.reject();
                                        }
                                });
                        };
                        return promise;
                };
                
                messageReplyUI.plugins.addAll({
                        "labels" : new Model(labels),
                        "errormsg" : new Model(error),
                        "reply" : new Model(msgReply, {
                                        setAvatar : function(author){
                                                this.setAttribute("style", "background: url('"+ Config.get("avatar") + "') no-repeat center center;background-size:cover;");
                                        },
                                        setCC : function(type){
                                                switch(type){
                                                        case "replyall":
                                                                break;
                                                        case "forward" :
                                                                break;
                                                        default:
                                                                this.innerHTML = msgReply.get("message").username;
                                                                break;
                                                }        
                                        },
                                        setSubject : function(type){
                                                switch(type){
                                                        case "replyall":
                                                                break;
                                                        case "forward" :
                                                                break;
                                                        default:
                                                                this.innerHTML = "  Re : " + msgReply.get("message").object;
                                                                break;
                                                }
                                        }
                                }),
                        "replyevent" : new Event(messageReplyUI)
                });
                
                messageReplyUI.template = '<div><div class="avatar" data-reply="bind: setAvatar, message.author"></div><form class="form"><p><textarea class="mail-header" data-labels="bind:placeholder, tocontactlbl" data-reply="bind: value, toList"></textarea></p><p><textarea class="mail-header" data-labels="bind:placeholder, cclbl" data-reply="bind: value, ccList"></textarea></p><p><span class="subject" data-labels="bind:innerHTML, subjectlbl"></span><span data-reply="bind:innerHTML, object"></span></p><p><textarea class="input" data-reply="bind:value, body"></textarea></p><blockquote class="original" data-reply="bind:innerHTML, original"></blockquote><p><legend>Signature</legend><textarea class="signature" data-reply="bind:value, signature"></textarea></p><div class="sendmail-footer"><p class="send"><label class="cancelmail" data-labels="bind:innerHTML, cancellbl" data-replyevent="listen: touchstart, press; listen:touchend, cancel">Cancel</label><label class="sendmail" data-labels="bind:innerHTML, sendlbl" data-replyevent="listen:touchstart, press; listen:touchend, send">Send</label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p></div></div>';
                
                messageReplyUI.reset = function reset(msg, type){
                        msgReply.reset({
                                "signature":"",
                                "original":"",
                                "author": user.get("_id"),
                                "username" : user.get("username"),
                                "firstname" : user.get("firstname"),
                                "toList": "",
                                "ccList": "",
                                "object": "",
                                "body": ""
                                });
                        msgReply.set("type", type);
                        (user.get("signature")) ? msgReply.set("signature", user.get("signature")) : msgReply.set("signature", user.get("username"));
                        msgReply.set("original", labels.get("on")+ Utils.formatDate(msg.date)+"</p><p>"+msg.username+labels.get("ideawrotelbl")+"</p><p>"+ labels.get("subjectlbl") + msg.object+"</p><hr><p>"+ cleanBody(msg.body) + "</p>")
                        switch(type){
                                case "replyall":
                                        (msg.ccList) ? msgReply.set("toList", msg.username.concat(", "+msg.ccList)) : msgReply.set("toList", msg.username);
                                        msgReply.set("object", "Re : "+msg.object);
                                        break;
                                case "forward" :
                                        msgReply.set("toList", "");
                                        msgReply.set("object", "Fwd : "+msg.object);
                                        break;
                                default:
                                        msgReply.set("toList", msg.username);
                                        msgReply.set("object", "Re : "+msg.object);
                                        break;
                        }
                        msgReply.set("message", msg);
                        messageReplyUI.place(document.getElementById("msgreply"));      
                };
                
                messageReplyUI.press = function(event, node){
                        node.classList.add("pressed");
                };
                        
                messageReplyUI.cancel = function(event, node){
                        node.classList.remove ("pressed");
                        sendInProgress = false;
                        document.getElementById("msgreply").classList.add("invisible");     
                };
                        
               messageReplyUI.send = function(event, node){
                                var now = new Date(), json={};
                                node.classList.remove('pressed');
                                
                                if (!sendInProgress){
                                        sendInProgress = true;
                                        // reset error
                                        error.set("errormsg", "");
                                        
                                        // build json object
                                        json = JSON.parse(msgReply.toJSON());
                                        // set type to MSG
                                        json.type = "MSG";
                                        
                                        // append original message to body
                                        json.body = json.body.concat("<br><br>"+json.original);
                                        
                                        // check recipients and send message if ok
                                        json.dest = [];
                                        validateRecipients(function(result){json.dest=result;}).then(function(){
                                                if (!error.get("errormsg")){
                                                        json.date = [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
                                                        
                                                        transport.request("Notify", json, function(result){
                                                                sendInProgress = false;
                                                                error.set("errormsg", labels.get("messagesentok"));
                                                                setTimeout(function(){error.set("errormsg", "");sendInProgress=false;document.getElementById("msgreply").classList.add("invisible");}, 2000);
                                                        });
                                                }
                                                else{
                                                        console.log(result);
                                                        sendInProgress = false;
                                                }
                                        });
                                }    
                };
                
                return messageReplyUI;        
           };
        });
