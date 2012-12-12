define("Ideafy/Connect/NewMessage", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store", "Promise"],
        function(Widget, Model, Event, Config, Store, Promise){
                
                return function NewMessageConstructor(){
                        
                        var newMessageUI = new Widget(),
                            message = new Store(),
                            error = new Store({"errormsg":""}),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            transport = Config.get("transport"),
                            sendInProgress = false;
                            validateRecipients = function(onEnd){
                                    var to = message.get("toList").toLowerCase().split(/,|;/),
                                        cc = message.get("ccList").toLowerCase().split(/,|;/),
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
                            
                        newMessageUI.plugins.addAll({
                                "labels": new Model(labels),
                                "errormsg": new Model(error),
                                "newmessage" : new Model(message,{
                                        setAvatar : function(author){
                                                this.setAttribute("style", "background: url('"+ Config.get("avatar") + "') no-repeat center center;background-size:cover;");
                                        }
                                }),
                                "newmessageevent" : new Event(newMessageUI)
                        });
                        
                        newMessageUI.template = '<div id="newmsg"><div class="header blue-dark"><span data-labels="bind: innerHTML, newmsg">New message</span></div><div class="avatar" data-newmessage="bind: setAvatar, author"></div><form class="form"><p><textarea class="mail-header" data-newmessage="bind: value, toList" data-labels="bind:placeholder, tocontactlbl"></textarea></p><p><textarea class="mail-header" data-newmessage="bind: value, ccList" data-labels="bind:placeholder, cclbl"></textarea></p><p><input type="text" class="input" data-newmessage="bind:value, object" data-labels="bind:placeholder, subjectlbl"></textarea></p><p><textarea class="input" data-newmessage="bind:value, body"></textarea></p><p><legend>Signature</legend><textarea class="mail-header" data-newmessage="bind:innerHTML, signature"></textarea></p><div class="sendmail-footer"><p class="send"><label class="cancelmail" data-labels="bind:innerHTML, cancellbl" data-newmessageevent="listen: touchstart, press; listen:touchend, cancel">Cancel</label><label class="sendmail" data-labels="bind:innerHTML, sendlbl" data-newmessageevent="listen:touchstart, press; listen:touchend, send">Send</label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p></div></div>';
                        
                        newMessageUI.reset = function reset(){
                                message.reset({"author": user.get("_id"), "username": user.get("username"), "type": "MSG", "signature": user.get("username"), "toList":"", "ccList":"", "object":"", "body":"", date: null}); 
                                error.reset({"errormsg":""});       
                        };
                        
                        newMessageUI.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        newMessageUI.cancel = function(event, node){
                                node.classList.remove ("pressed");       
                        };
                        
                        newMessageUI.send = function(event, node){
                                var now = new Date(), json={};
                                node.classList.remove('pressed');
                                
                                if (!sendInProgress){
                                        sendInProgress = true;
                                        // reset error
                                        error.set("errormsg", "");
                                        
                                        // build json object
                                        json = JSON.parse(message.toJSON());
                                        
                                        //validate message
                                        if (!message.get("object")){
                                                error.set("errormsg", labels.get("entersubjectlbl"));
                                                sendInProgress = false;
                                        }
                                        // check recipients and send message if ok
                                        json.dest = [];
                                        validateRecipients(function(result){json.dest=result;}).then(function(){
                                                if (!error.get("errormsg")){
                                                        json.date = [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
                                                        
                                                        transport.request("Notify", json, function(result){
                                                                sendInProgress = false;
                                                                newMessageUI.reset();
                                                                error.set("errormsg", labels.get("messagesentok"));
                                                                setTimeout(function(){error.set("errormsg", "");sendInProgress=false;}, 3000);
                                                        });
                                                }
                                                else{
                                                        console.log(result);
                                                        sendInProgress = false;
                                                }
                                        });
                                }    
                        };
                        
                        return newMessageUI;
                };
        });
