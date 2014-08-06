/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      emily = require("../../../libs/emily"),
      Spinner = require("../../../libs/spin.min"),
      Widget = olives.OObject,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Store = emily.Store,
      Config = require("../../../services/config"),
      AutoContact = require("../../../services/autocontact"),
      Promise = emily.Promise;

module.exports = function NewMessageConstructor($close){
                        
                        var newMessageUI = new Widget(),
                            message = new Store(),
                            error = new Store({"errormsg":""}),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            transport = Config.get("transport"),
                            sendInProgress = false,
                            spinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -8, left: 340}).spin(),
                            autoCompleteUIs = {},
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
                        
                        newMessageUI.template = '<div id="newmsg"><div class="header blue-dark"><span data-labels="bind: innerHTML, newmsg">New message</span></div><div class="avatar" data-newmessage="bind: setAvatar, author"></div><form class="form"><p><textarea class="mail-header" name="toList" data-newmessage="bind: value, toList" data-newmessageevent="listen: mousedown, displayAutoContact; listen:keyup, updateAutoContact" data-labels="bind:placeholder, tocontactlbl"></textarea></p><div id="tolistauto" class="invisible"></div><p><textarea class="mail-header" name="ccList" data-newmessage="bind: value, ccList" data-labels="bind:placeholder, cclbl" data-newmessageevent="listen: mousedown, displayAutoContact; listen:keyup, updateAutoContact"></textarea></p><div id="cclistauto" class="invisible"></div><p><input type="text" class="input" data-newmessage="bind:value, object" data-labels="bind:placeholder, subjectlbl"></p><p><textarea class="input" data-newmessage="bind:value, body"></textarea></p><p><legend>Signature</legend><textarea class="signature" data-newmessage="bind:value, signature"></textarea></p><div class="sendmail-footer"><p class="send"><label class="cancelmail" data-labels="bind:innerHTML, cancellbl" data-newmessageevent="listen: mousedown, press; listen:mouseup, cancel">Cancel</label><label class="sendmail" data-labels="bind:innerHTML, sendlbl" data-newmessageevent="listen:mousedown, press; listen:mouseup, send">Send</label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p></div></form></div>';
                        
                        newMessageUI.reset = function reset(data){
                                var i, l, list = "";
                                message.reset({"author": user.get("_id"), "username": user.get("username"), "firstname": user.get("firstname"), "type": "MSG", "signature": user.get("username"), "toList":"", "ccList":"", "object":"", "body":"", date: null}); 
                                (user.get("signature")) ? message.set("signature", user.get("signature")) : message.set("signature", user.get("username"));
                                error.reset({"errormsg":""});
                                
                                if (data){
                                        if (data.type === "user") message.set("toList", data.username);
                                        else {
                                                for (i=0, l=data.contacts.length; i<l;i++){
                                                        (list)? list = list+", "+data.contacts[i].username : list = data.contacts[i].username;        
                                                }
                                                message.set("toList", list);
                                        }
                                }    
                        };
                        
                        newMessageUI.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        newMessageUI.cancel = function(event, node){
                                node.classList.remove ("pressed");
                                sendInProgress = false;
                                newMessageUI.reset();
                                $close("#defaultPage");      
                        };
                        
                        newMessageUI.displayAutoContact = function(event, node){
                                var name=node.getAttribute("name"), dom, ui,
                                    updateField = function(value){
                                           message.set(name, value);
                                    };
                                
                                (name === "toList")?dom = document.getElementById("tolistauto"):dom = document.getElementById("cclistauto");
                                ui = new AutoContact(dom, node, updateField);
                                // add to autoCompleteUIs object
                                autoCompleteUIs.name = ui;
                                dom.classList.remove("invisible");      
                        };
                        
                        newMessageUI.updateAutoContact = function(event, node){
                                var name = node.getAttribute("name");
                                if (event.keyCode === 13){
                                        node.removeChild(node.firstChild);
                                }
                                else if (event.keyCode === 186 || event.keyCode === 188){ // , or ;
                                        autoCompleteUIs.name.init();        
                                }
                                else {
                                        autoCompleteUIs.name.updateList();
                                }    
                        };
                        
                        newMessageUI.send = function(event, node){
                                var now = new Date(), json={};
                                node.classList.add("invisible");
                                node.classList.remove('pressed');
                                spinner.spin(node.parentNode);
                                if (!sendInProgress){
                                        sendInProgress = true;
                                        // reset error
                                        error.set("errormsg", "");
                                        
                                        // build json object
                                        json.author = message.get("author");
                                        json.username = message.get("username");
                                        json.firstname = message.get("firstname");
                                        json.signature = message.get("signature");
                                        json.toList = message.get("toList");
                                        json.ccList = message.get("ccList");
                                        json.object = message.get("object");
                                        json.body = message.get("body");
                                        json.type = "MSG";
                                        
                                        //validate message
                                        if (!message.get("object")){
                                                error.set("errormsg", labels.get("entersubjectlbl"));
                                                sendInProgress = false;
                                                spinner.stop();
                                                node.classList.remove("invisible");
                                        }
                                        // check recipients and send message if ok
                                        json.dest = [];
                                        validateRecipients(function(result){json.dest=result;}).then(function(){
                                                if (!error.get("errormsg")){
                                                        json.date = [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
                                                        
                                                        transport.request("Notify", json, function(result){
                                                                sendInProgress = false;
                                                                spinner.stop();
                                                                node.classList.remove("invisible");
                                                                newMessageUI.reset();
                                                                error.set("errormsg", labels.get("messagesentok"));
                                                                setTimeout(function(){
                                                                        error.set("errormsg", "");
                                                                        node.classList.remove("invisible");
                                                                        $close("#defaultPage");}, 2000);
                                                        });
                                                }
                                                else{
                                                        sendInProgress = false;
                                                        spinner.stop();
                                                        node.classList.remove("invisible");
                                                }
                                        });
                                }    
                        };
                        
                        return newMessageUI;
};
