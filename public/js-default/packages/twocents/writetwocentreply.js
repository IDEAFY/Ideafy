
define(["OObject", "Store", "Bind.plugin", "Event.plugin", "service/config", "service/utils", "lib/spin.min"],
        function(Widget, Store, ModelPlugin, EventPlugin, Config, Utils, Spinner){
                
                function WriteTwocentReplyConstructor($parent){
                        
                        var user = Config.get("user"),
                            transport = Config.get("transport"),
                            currentIdea, currentTwocent, position, replyTo,
                            now = new Date(),
                            cancel,
                            publishSpinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -8, left: 24}),
                            replyTemplate = {"author": user.get("_id"), "message": "", "firstname": user.get("firstname"), "date": "", "datemod": "", "plusones": 0},
                            reply = new Store(replyTemplate);
                            
                        this.plugins.addAll({
                                "model": new ModelPlugin(reply, {
                                        date : function date(date){
                                                this.innerHTML = Utils.formatDate(date);
                                        }
                                }),
                                "config": new ModelPlugin(Config, {
                                        setAvatar : function(avatar){
                                                this.setAttribute("style", "background: url('"+ avatar + "') no-repeat center center;background-size:cover;");
                                        }        
                                }),
                                "writereplyevent" : new EventPlugin(this),
                                "labels" : new ModelPlugin(Config.get("labels"))
                        });
                        
                        this.template = '<div class="writeTwocent writeTwocentReply"><div class="replyAvatar" data-config="bind: setAvatar, avatar"></div><textarea class="twocentText replyMessage" data-labels="bind: placeholder, addtwocentreplyplaceholder" data-model="bind: value, message"></textarea><div class="writeFooter"><ul class="twocentContext"><li class="creadate"><span class="creadatelbl" data-labels="bind:innerHTML, twocentcreationdate"></span><span class="date" data-model="bind: date, date"></span></li></ul><div class="twocentCancel" data-labels="bind: innerHTML, cancellbl" data-writereplyevent="listen: mousedown, press; listen: mouseup, cancel">Cancel</div><div class="twocentPublish" data-labels="bind: innerHTML, publishlbl" data-writereplyevent="listen: mousedown, press; listen: mouseup, publish;">Publish</div></div></div>';
                        
                        this.reset = function($id, $twocent, $reply, $pos, $replyTo, $cancel){
                                var now = new Date();
                                
                                if ($id && $twocent) {
                                        currentIdea = $id;
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
                                        reply.reset(replyTemplate);
                                        reply.set("date", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                        editTCR = "newreply";
                                }
                                
                                cancel = $cancel;  
                        };
                
                        this.cancel = function(event, node){
                                node.setAttribute("style", "-webkit-box-shadow: none; background: #e69b73;");
                                // reset reply message
                                reply.reset(replyTemplate);
                                // hide twocent writing interface
                                (cancel) ? cancel():$parent.classList.add("invisible");
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
                                        
                                        json = {docId: currentIdea, type: type, position: position, twocent: currentTwocent, reply: content};
                                        transport.request("WriteTwocent", json, function(result){
                                                if (result !== "ok"){
                                                        alert(Config.get("labels").get("somethingwrong"));        
                                                }
                                                else{
                                                        // hide writing interface
                                                        $parent.classList.add("invisible");
                                                        
                                                }
                                                node.setAttribute("style", "background: #8cab68;");
                                                publishSpinner.stop();               
                                        });
                                }
                        };
                
                        this.press = function(event, node){
                                node.setAttribute("style", "-webkit-box-shadow: inset 0 0 5px 1px rgba(0,0,0,0.6); background: #666666;");
                        };
                        
                }
                
                return function WriteTwocentReplyFactory($parent){
                        WriteTwocentReplyConstructor.prototype = new Widget;
                        return new WriteTwocentReplyConstructor($parent); 
                };                    
        });