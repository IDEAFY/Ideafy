/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("TwocentReplyList", ["Olives/OObject", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Ideafy/Utils", "Config", "WriteTwocentReply", "Ideafy/Avatar"],
        function(Widget, Store, ModelPlugin, EventPlugin, Utils, Config, WriteTwocentReply, Avatar){
                
                function TwocentReplyListConstructor($data, $id, $tc, $view){
                        
                        var store = new Store($data),
                            ui = this,
                            avatars,
                            user = Config.get("user"),
                            labels = Config.get("labels"),
                            transport = Config.get("transport");
                        
                        ui.plugins.addAll({
                                "reply": new ModelPlugin(store, {
                                        date : function date(date){
                                               if (date){
                                                       this.innerHTML = Utils.formatDate(date);
                                               }
                                        },
                                        setFirstname : function(firstname){
                                               var id = this.getAttribute("data-reply_id");
                                               this.innerHTML = firstname;
                                               if (store.get(id).author === user.get("_id")){
                                                        this.innerHTML = labels.get("youlbl");
                                                }
                                        },
                                        setReplylbl : function(firstname){
                                               var id = this.getAttribute("data-reply_id");
                                               this.innerHTML = labels.get("twocentreplycommentlbl");
                                               if (store.get(id).author === user.get("_id")){
                                                        this.innerHTML = labels.get("yourepliedlbl");
                                                }
                                        },
                                        setAvatar : function setAvatar(author){
                                                var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar([author]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);   
                                        },
                                        setVisible : function(author){
                                                (author && author === user.get("_id")) ? this.setAttribute("style", "display: block;") : this.setAttribute("style", "display: none;");
                                        },
                                        setInVisible : function(author){
                                                (author && author === user.get("_id")) ? this.setAttribute("style", "display: none;") : this.setAttribute("style", "display: block;");
                                        }
                                  }),
                                  "replyevent" : new EventPlugin(ui),
                                  "labels": new ModelPlugin(labels)
                        });
                        
                   ui.template = '<ul class="replies" data-reply="foreach"><li class="twocentReply"><div class="twocentHeader"><div class="replyAvatar" data-reply="bind:setAvatar, author"></div><div class="twocentAuthor" data-reply="bind: setFirstname, firstname"></div><span class="commentLabel" data-labels="bind: setReplylbl, firstname"></span><br/><div class="twocentDate date" data-reply="bind: date, date"></div><div class="twocentMenu"><div class="twocentButton twocentEditButton" data-reply="bind: setVisible, author" data-replyevent="listen: touchstart, edit"></div><div class="twocentButton twocentDeleteButton" data-reply="bind: setVisible, author" data-replyevent="listen: touchstart, deleteTwocentReply"></div><div class="twocentButton twocentReplyButton" data-reply="bind: setInVisible, author" data-replyevent="listen:touchstart, reply"></div></div></div><p class="twocentMessage replyMessage" data-reply="bind: innerHTML, message"></p><div class="writePublicTwocentReply replyToReply invisible"></div></li></ul>';
                   
                   ui.edit = function(event, node){
                                var id = node.getAttribute("data-reply_id"),
                                    currentUI = ui.dom.children[id],
                                    writeUI = new WriteTwocentReply(),
                                    cancel = function cancel(){
                                            ui.dom.replaceChild(currentUI, writeUI.dom);            
                                    },
                                    frag = document.createDocumentFragment();
 
                                writeUI.reset($id, $tc, $data[id], id, null, cancel);
                                writeUI.render();
                                writeUI.place(frag);
                                //replace current twocent with writeUI
                                ui.dom.replaceChild(frag, currentUI);
                                UI = ui.dom;
                                CURRENT = currentUI;
                                WRITE = writeUI.dom;       
                        };
                        
                        ui.deleteTwocentReply = function(event, node){
                               var position = node.getAttribute("data-reply_id"),
                                    json = {docId: $id, type: "deltcreply", twocent: $tc, position: position};
                                transport.request("WriteTwocent", json, function(result){
                                        if (result !== "ok"){
                                                alert(Config.get("labels").get("somethingwrong"));        
                                        }               
                                });    
                        };
                        
                        ui.reply = function(event, node){
                                var id = node.getAttribute("data-reply_id"),
                                    twocentParent = document.querySelector(".twocent[data-twocents_id='"+$tc+"']"),
                                    parent = twocentParent.querySelector(".writePublicTwocentReply[data-reply_id='"+id+"']"),
                                    frag = document.createDocumentFragment(),
                                    writeUI = new WriteTwocentReply(parent);
                                // create writeReplyUI and pass info about initial reply
                                writeUI.reset($id, $tc, null, id, $data[id].firstname);
                                writeUI.render();
                                writeUI.place(frag);
                                 
                                if (!parent.hasChildNodes()){
                                        parent.appendChild(frag);
                                }
                                parent.classList.remove("invisible");                     
                        };     
              }
                        
              return function TwocentReplyListFactory($data, $id, $tc, $view){
                   TwocentReplyListConstructor.prototype = new Widget;
                   return new TwocentReplyListConstructor($data, $id, $tc, $view);       
              };    
                
        });
        

define("WriteTwocentReply", ["Olives/OObject", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Ideafy/Utils"],
        function(Widget, Store, ModelPlugin, EventPlugin, Config, Utils){
                
                function WriteTwocentReplyConstructor($parent){
                        
                        var user = Config.get("user"),
                            transport = Config.get("transport"),
                            currentIdea, currentTwocent, position, replyTo,
                            now = new Date(),
                            cancel,
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
                        
                        this.template = '<div class="writeTwocent writeTwocentReply"><div class="replyAvatar" data-config="bind: setAvatar, avatar"></div><textarea class="twocentText replyMessage" data-labels="bind: placeholder, addtwocentreplyplaceholder" data-model="bind: value, message"></textarea><div class="writeFooter"><ul class="twocentContext"><li class="creadate"><span class="creadatelbl" data-labels="bind:innerHTML, twocentcreationdate"></span><span class="date" data-model="bind: date, date"></span></li></ul><div class="twocentCancel" data-labels="bind: innerHTML, cancellbl" data-writereplyevent="listen: touchstart, press; listen: touchend, cancel">Cancel</div><div class="twocentPublish" data-labels="bind: innerHTML, publishlbl" data-writereplyevent="listen: touchstart, press; listen: touchend, publish;">Publish</div></div></div>';
                        
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
                                node.setAttribute("style", "-webkit-box-shadow: none; background: #8cab68;");
                                // message should not be empty (or do nothing)
                                if (reply.get("message")){
                                        var     content = JSON.parse(reply.toJSON()), json, type;
                                        
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