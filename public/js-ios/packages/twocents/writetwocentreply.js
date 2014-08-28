/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../libs/olives"),
      emily = require("../../libs/emily"),
      Widget = olives.OObject,
      Store = emily.Store,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Config = require("../../services/config"),
      Utils = require("../../services/utils"),
      Spinner = require("../../libs/spin.min");

function WriteTwocentReplyConstructor($parent){
                        
                        var user = Config.get("user"),
                            transport = Config.get("transport"),
                            currentDoc, currentTwocent, position, replyTo,
                            now = new Date(),
                            cancel,
                            publishSpinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -8, left: 24}),
                            replyTemplate = {"author": user.get("_id"), "message": "", "firstname": user.get("firstname"), "date": "", "datemod": "", "plusones": 0},
                            reply = new Store(replyTemplate);
                            
                        this.seam.addAll({
                                "model": new Model(reply, {
                                        date : function date(date){
                                                this.innerHTML = Utils.formatDate(date);
                                        }
                                }),
                                "config": new Model(Config, {
                                        setAvatar : function(avatar){
                                                this.setAttribute("style", "background: url('"+ avatar + "') no-repeat center center;background-size:cover;");
                                        }        
                                }),
                                "writereplyevent" : new Event(this),
                                "labels" : new Model(Config.get("labels"))
                        });
                        
                        this.template = '<div class="writeTwocent writeTwocentReply"><div class="replyAvatar" data-config="bind: setAvatar, avatar"></div><textarea class="twocentText replyMessage" data-labels="bind: placeholder, addtwocentreplyplaceholder" data-model="bind: value, message"></textarea><div class="writeFooter"><ul class="twocentContext"><li class="creadate"><span class="creadatelbl" data-labels="bind:innerHTML, twocentcreationdate"></span><span class="date" data-model="bind: date, date"></span></li></ul><div class="twocentCancel" data-labels="bind: innerHTML, cancellbl" data-writereplyevent="listen: touchstart, press; listen: touchend, cancel">Cancel</div><div class="twocentPublish" data-labels="bind: innerHTML, publishlbl" data-writereplyevent="listen: touchstart, press; listen: touchend, publish;">Publish</div></div></div>';
                        
                        this.reset = function($id, $twocent, $reply, $pos, $replyTo, $cancel){
                                var now = new Date();
                                
                                if ($id && $twocent) {
                                        currentDoc = $id;
                                        currentTwocent = $twocent;
                                }
                                // is it a response to an existing reply?
                                ($replyTo) ? replyTo = $replyTo : replyTo = "";
                                
                                if ($reply){
                                        reply.reset($reply);
                                        editTCR = $reply; // keeping original post before changes
                                        position = $pos;
                                        reply.set("datemod", [now.getFullYear(), now.getMonth(), now.getDate()]); // setting modification date
                                }
                                else {
                                        reply.reset({"author": user.get("_id"), "message": "", "firstname": user.get("firstname"), "date": "", "datemod": "", "plusones": 0});
                                        reply.set("date", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                        editTCR = "newreply";
                                }
                                
                                cancel = $cancel;  
                        };
                
                        this.cancel = function(event, node){
                                node.setAttribute("style", "-webkit-box-shadow: none; background: #e69b73;");
                                // hide twocent writing interface
                                (cancel) ? cancel():$parent.classList.add("invisible");
                                // reset reply message
                                reply.reset({"author": user.get("_id"), "message": "", "firstname": user.get("firstname"), "date": "", "datemod": "", "plusones": 0});
                        };
                
                        this.publish = function(event, node){
                                node.setAttribute("style", "-webkit-box-shadow: none; background: none;");
                                // message should not be empty (or do nothing)
                                if (reply.get("message")){
                                        var     content = JSON.parse(reply.toJSON()), json, type;
                                        
                                        publishSpinner.spin(node);
                                        (editTCR === "newreply") ? type = editTCR : type = "editreply";
                                        // add @username at beginning of message if it's a reply to a reply
                                        if (replyTo) {content.message = "@ "+replyTo+" : "+content.message;}
                                        
                                        json = {docId: currentDoc, type: type, position: position, twocent: currentTwocent, reply: content};
                                        transport.request("WriteTwocent", json, function(result){
                                                node.setAttribute("style", "background: #8cab68;");
                                                publishSpinner.stop(); 
                                                if (result !== "ok"){
                                                        alert(Config.get("labels").get("somethingwrong"));        
                                                }
                                                else{
                                                        // hide writing interface
                                                        $parent.classList.add("invisible");
                                                        reply.reset({"author": user.get("_id"), "message": "", "firstname": user.get("firstname"), "date": "", "datemod": "", "plusones": 0});
                                                }               
                                        });
                                }
                        };
                
                        this.press = function(event, node){
                                node.setAttribute("style", "-webkit-box-shadow: inset 0 0 5px 1px rgba(0,0,0,0.6); background: #666666;");
                        };
};
                
module.exports = function WriteTwocentReplyFactory($parent){
        WriteTwocentReplyConstructor.prototype = new Widget;
        return new WriteTwocentReplyConstructor($parent); 
};