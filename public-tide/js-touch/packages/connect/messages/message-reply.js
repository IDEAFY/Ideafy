/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Store", "Bind.plugin", "Event.plugin", "service/config", "service/utils", "Promise", "service/autocontact"],
        function(Widget, Store, Model, Event, Config, Utils, Promise, AutoContact){
                
           return function MessageReplyConstructor(){
           
                var messageReplyUI = new Widget(),
                    msgReply = new Store(),
                    originalMsg,
                    autoCompleteUIs = {},
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
                        // check recipients -- should be in original message or in user contact list
                        for (i=0, l=to.length; i<l; i++){
                                if (contacts.search(to[i].trim()) > -1 || originalMsg.toList.search(to[i].trim())>-1 || originalMsg.ccList.search(to[i].trim())>-1){
                                        dest.push(to[i].trim());
                                }
                                else{
                                        error.set("errormsg", labels.get("tolbl")+" : "+to[i].trim()+labels.get("notavalidcontact"));
                                        sendInProgress = false;
                                        promise.reject();
                                        break;
                                }       
                        }
                        // check cc list -- should be original + addition of new users from contact
                        if (!error.get("errormsg") && cc[0] !== ""){
                                for (i=0, l=cc.length; i<l; i++){
                                        if (contacts.search(cc[i].trim()) > -1 || originalMsg.toList.search(cc[i].trim())>-1 || originalMsg.ccList.search(cc[i].trim())>-1){
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
                                                promise.fulfill();
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
                
                messageReplyUI.template = '<div><div class="avatar" data-reply="bind: setAvatar, message.author"></div><form class="form"><p><textarea name="toList" class="mail-header" data-labels="bind:placeholder, tocontactlbl" data-reply="bind: value, toList" data-replyevent="listen: touchstart, displayAutoContact; listen:keypress, updateAutoContact"></textarea></p><div id="tolistauto" class="invisible"></div><p><textarea name="ccList" class="mail-header" data-labels="bind:placeholder, cclbl" data-reply="bind: value, ccList" data-replyevent="listen: touchstart, displayAutoContact; listen:keypress, updateAutoContact"></textarea></p><div id="cclistauto" class="invisible"></div><p><span class="subject" data-labels="bind:innerHTML, subjectlbl"></span><span data-reply="bind:innerHTML, object"></span></p><p><textarea class="input" data-reply="bind:value, body"></textarea></p><blockquote class="original" data-reply="bind:innerHTML, original"></blockquote><p><legend>Signature</legend><textarea class="signature" data-reply="bind:value, signature"></textarea></p><div class="sendmail-footer"><p class="send"><label class="cancelmail" data-labels="bind:innerHTML, cancellbl" data-replyevent="listen: touchstart, press; listen:touchend, cancel">Cancel</label><label class="sendmail" data-labels="bind:innerHTML, sendlbl" data-replyevent="listen:touchstart, press; listen:touchend, send">Send</label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p></div></div>';
                
                messageReplyUI.reset = function reset(msg, type){
                        originalMsg = msg;
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
                        msgReply.set("original", labels.get("on")+ Utils.formatDate(msg.date)+"</p><p>"+msg.username+labels.get("ideawrotelbl")+"</p><p>"+ labels.get("subjectlbl") + msg.object+"</p><hr><p>"+ msg.body + "</p>")
                        switch(type){
                                case "replyall":
                                        (msg.ccList) ? msgReply.set("toList", msg.username.concat(", "+msg.ccList)) : msgReply.set("toList", msg.username);
                                        (msg.object.search("Re :") !== 0)  ? msgReply.set("object", "Re : "+msg.object) : msgReply.set("object", msg.object);
                                        break;
                                case "forward" :
                                        msgReply.set("toList", "");
                                        (msg.object.search("Fwd :") !== 0) ? msgReply.set("object", "Fwd : "+msg.object) : msgReply.set("object", msg.object)
                                        break;
                                default:
                                        msgReply.set("toList", msg.username);
                                        (msg.object.search("Re :") !== 0) ? msgReply.set("object", "Re : "+msg.object) : msgReply.set("object", msg.object);
                                        break;
                        }
                        msgReply.set("message", msg);
                        messageReplyUI.place(document.getElementById("msgreply"));      
                };
                
                messageReplyUI.displayAutoContact = function(event, node){
                                var name=node.getAttribute("name"), dom, ui,
                                    updateField = function(value){
                                           msgReply.set(name, value);
                                    };
                                
                                (name === "toList")?dom = document.getElementById("tolistauto"):dom = document.getElementById("cclistauto");
                                ui = new AutoContact(dom, node, updateField);
                                // add to autoCompleteUIs object
                                autoCompleteUIs.name = ui;
                                dom.classList.remove("invisible");      
                        };
                        
                messageReplyUI.updateAutoContact = function(event, node){
                                var name = node.getAttribute("name");
                                if (event.keyCode === 13){
                                        node.removeChild(node.firstChild);
                                }
                                else if (event.keyCode === 186 || event.keyCode === 188){
                                        autoCompleteUIs.name.init();        
                                }
                                else {
                                        autoCompleteUIs.name.updateList();
                                }    
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
